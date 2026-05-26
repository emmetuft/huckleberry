# Frontend deployment — AWS production

End-to-end runbook for getting the Huckleberry SPA hosted on S3 + CloudFront, fronted by Route 53, with a CD pipeline triggered by `git push`.

**Prereq:** laptop-side AWS access set up per **[`~/dev/huckleberry-server/docs/aws-local-setup.md`](../../huckleberry-server/docs/aws-local-setup.md)** (AWS CLI, SSO profile). The S3-upload smoke step below assumes you can already run `aws s3 ls`.

**Sibling doc:** `~/dev/huckleberry-server/docs/deployment-bff.md` — same shape, for the BFF.

## What you're standing up

```
                   Route 53                       CloudFront
              huckleberry.com  ───────►  distribution (ACM cert us-east-1)
                                          │
                       ┌──────────────────┴───────────────────┐
                       │ default behavior                     │ /api/* behavior
                       ▼                                      ▼
                S3 bucket (private)                   ALB origin (api.huckleberry.com)
              huckleberry-fe-prod                    → ECS Fargate (BFF)
                       │
                       │ access via OAC only
                       │ (origin access control)
                       ▼
                  Vite build artifacts
                  /index.html
                  /assets/<hash>.js
                  /assets/<hash>.css
```

What each piece is for:

- **S3 bucket** — stores the built SPA. Vite outputs `dist/` with `index.html` plus hashed-name assets. Bucket is private; only CloudFront can read it (via OAC).
- **CloudFront** — global CDN. Caches the SPA at edge locations close to users, terminates TLS, and handles SPA routing via custom error responses (the trick that makes `/workspace` work on direct URL hits even though there's no `workspace` key in S3).
- **OAC (Origin Access Control)** — the modern replacement for OAI (Origin Access Identity, deprecated). Lets CloudFront sign requests to S3 using SigV4. The bucket policy trusts only that specific CloudFront distribution.
- **ACM cert in us-east-1** — CloudFront only accepts certs from the `us-east-1` region, no matter where the rest of your stack lives. One-time annoyance.
- **Route 53 alias** — `huckleberry.com` → CloudFront distribution. Alias records are free (vs. CNAME-style queries) and resolve at the AWS edge.
- **`/api/*` second behavior** — CloudFront has two behaviors. The default serves S3. A separate behavior for `/api/*` forwards to the ALB without caching. This is what keeps the browser **same-origin** for cookie auth — `huckleberry.com` and `huckleberry.com/api/auth/me` share the cookie jar with no CORS.

Assumptions throughout: region **`us-west-2`** for the bucket. Domain **`huckleberry.com`**.

---

## How SPA routing on S3 + CloudFront works

A common point of confusion. When you visit `huckleberry.com/workspace`:

1. Browser asks CloudFront for `/workspace`.
2. CloudFront looks for that key in S3. It doesn't exist — your build only emits `/index.html`, `/assets/*.js`, etc.
3. S3 returns 403 (because of OAC, you don't even get 404 — listing is forbidden so missing keys come back as 403).
4. CloudFront's **custom error response** rule sees the 403, swaps the response to `/index.html` with status 200.
5. The SPA boots up, React Router reads the URL, renders the `/workspace` route.

Without the error-response rule, you'd see "Access Denied" on every URL except `/`. This is also how production `next` querystrings survive a refresh.

---

## One-time AWS setup

### 1. S3 bucket for the SPA bundle

```bash
aws s3api create-bucket \
  --bucket huckleberry-fe-prod \
  --region us-west-2 \
  --create-bucket-configuration LocationConstraint=us-west-2

# Block all public access — CloudFront via OAC is the only reader
aws s3api put-public-access-block \
  --bucket huckleberry-fe-prod \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Enable versioning for rollback
aws s3api put-bucket-versioning \
  --bucket huckleberry-fe-prod \
  --versioning-configuration Status=Enabled

# Server-side encryption with SSE-S3 (free)
aws s3api put-bucket-encryption \
  --bucket huckleberry-fe-prod \
  --server-side-encryption-configuration '{
    "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]
  }'
```

Versioning matters: a bad deploy is fixed by promoting the previous version's `index.html` back to current. Without versioning, the previous bytes are gone the moment you `aws s3 cp`.

### 2. ACM cert in us-east-1

```bash
aws acm request-certificate \
  --domain-name huckleberry.com \
  --subject-alternative-names www.huckleberry.com \
  --validation-method DNS \
  --region us-east-1   # <-- must be us-east-1 for CloudFront
```

ACM returns a DNS validation record per domain. Add them to Route 53 (or whatever DNS host you use), wait for validation (usually 5–15 min).

### 3. CloudFront Origin Access Control

```bash
aws cloudfront create-origin-access-control \
  --origin-access-control-config '{
    "Name": "huckleberry-fe-prod-oac",
    "OriginAccessControlOriginType": "s3",
    "SigningBehavior": "always",
    "SigningProtocol": "sigv4"
  }'
```

Save the OAC ID — the distribution config below references it.

### 4. CloudFront distribution

This is the gnarly part. Either author through the AWS console (the easier path the first time) or via the CLI with a JSON config. Console flow:

- **Origins** — two:
  1. **S3 origin** — your bucket, OAC selected, "Origin access" = "Origin access control settings (recommended)".
  2. **ALB origin** (BFF) — domain name `api-internal.huckleberry.com` *or* the ALB DNS name directly. Use HTTPS only, viewer protocol policy "Redirect HTTP to HTTPS".

- **Behaviors** — two, in this order (CloudFront matches in declared order):

  | Path pattern | Origin | Cache policy | Origin request policy | Viewer protocol policy |
  |---|---|---|---|---|
  | `/api/*` | ALB | `CachingDisabled` (managed) | `AllViewer` (managed; forwards all headers, cookies, query strings) | HTTPS only |
  | `Default (*)` | S3 | `CachingOptimized` (managed) | none | Redirect HTTP→HTTPS |

  Why the ordering: the BFF needs to receive every request as if it weren't behind a CDN — pass headers (including `Cookie`, `Authorization`, `Content-Type`), don't cache anything. The SPA bundle is the opposite: cache aggressively, don't forward anything from the request.

- **Custom error responses** — under "Error pages":

  | HTTP error code | Response page path | HTTP response code | TTL |
  |---|---|---|---|
  | 403 | `/index.html` | 200 | 0 |
  | 404 | `/index.html` | 200 | 0 |

- **Alternate domain names (CNAMEs)** — `huckleberry.com`, `www.huckleberry.com`.
- **SSL certificate** — your us-east-1 ACM cert.
- **Default root object** — `index.html`.
- **Price class** — "Use all edge locations" or "US, Canada, Europe" depending on user geography. Cheaper price classes = fewer PoPs.

After creating, grab the distribution domain name (`d1234567890.cloudfront.net`) and ID.

### 5. S3 bucket policy — trust the OAC

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontServicePrincipal",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::huckleberry-fe-prod/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::<ACCT>:distribution/<DISTRIBUTION_ID>"
      }
    }
  }]
}
```

The `SourceArn` condition is what makes OAC secure — only requests from this specific distribution can read.

### 6. Route 53 alias

In your hosted zone for `huckleberry.com`:

```bash
aws route53 change-resource-record-sets --hosted-zone-id <ZONE_ID> \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "huckleberry.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",        
          "DNSName": "d1234567890.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

The magic `Z2FDTNDATAQYW2` is CloudFront's fixed hosted zone ID — every CloudFront alias uses it. Repeat for `www.huckleberry.com`.

### 7. IAM: OIDC provider + deployment role

The same OIDC provider you set up for the BFF works here. Add a second role scoped to this repo for FE deploys.

Trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::<ACCT>:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub":
          "repo:domo-development/huckleberry:*"
      }
    }
  }]
}
```

Permissions: read+write the bucket, invalidate CloudFront paths. Nothing else.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PushToFEBucket",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::huckleberry-fe-prod",
        "arn:aws:s3:::huckleberry-fe-prod/*"
      ]
    },
    {
      "Sid": "InvalidateCloudFront",
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::<ACCT>:distribution/<DISTRIBUTION_ID>"
    }
  ]
}
```

---

## First manual deploy

```bash
# Build (Vite emits to ./dist)
pnpm build

# Upload — two passes because cache lifetimes differ.

# 1. Hashed assets: immutable, cache 1 year
aws s3 sync dist/ s3://huckleberry-fe-prod/ \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable"

# 2. index.html: revalidate every minute, never cache for long
aws s3 cp dist/index.html s3://huckleberry-fe-prod/index.html \
  --cache-control "public, max-age=60, must-revalidate" \
  --content-type "text/html; charset=utf-8"

# Invalidate index.html at the edge (assets are already unique per build, no invalidation needed)
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/index.html"

# Smoke
curl -I https://huckleberry.com/                       # should be 200
curl -I https://huckleberry.com/workspace              # should be 200 (the index.html trick)
curl -I https://huckleberry.com/api/auth/me            # should be 200 (ALB origin) or 401
```

The two-pass upload matters. Vite emits filenames like `index.abc123.js` — those are content-addressed, so a 1-year `Cache-Control: immutable` is safe. `index.html` is the entry point that references those filenames, so it must revalidate frequently or browsers will keep loading the old build's JS bundle.

---

## GitHub Actions CD — `.github/workflows/deploy-fe.yml`

```yaml
name: Deploy FE

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

env:
  AWS_REGION: us-west-2
  S3_BUCKET: huckleberry-fe-prod
  CLOUDFRONT_DISTRIBUTION: ${{ vars.CLOUDFRONT_DISTRIBUTION }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Enable Corepack + install
        run: |
          corepack enable
          corepack pnpm install --frozen-lockfile

      - name: Build
        run: corepack pnpm build

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::<ACCT>:role/huckleberry-fe-deploy
          aws-region: ${{ env.AWS_REGION }}

      - name: Sync hashed assets (1-year immutable)
        run: |
          aws s3 sync dist/ s3://${{ env.S3_BUCKET }}/ \
            --exclude "index.html" \
            --cache-control "public, max-age=31536000, immutable" \
            --delete

      - name: Upload index.html (short TTL)
        run: |
          aws s3 cp dist/index.html s3://${{ env.S3_BUCKET }}/index.html \
            --cache-control "public, max-age=60, must-revalidate" \
            --content-type "text/html; charset=utf-8"

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ env.CLOUDFRONT_DISTRIBUTION }} \
            --paths "/index.html"

      - name: Smoke test
        run: |
          curl --fail -I https://huckleberry.com/
          curl --fail -I https://huckleberry.com/workspace
```

Pipeline phases:

1. Check out + install pnpm via Corepack.
2. `pnpm build` — Vite outputs `dist/`.
3. Assume the FE deploy role via OIDC.
4. Sync assets to S3 (two passes for cache-control split).
5. Invalidate `index.html` at CloudFront (assets are content-hashed, no invalidation needed).
6. Smoke-test the production URL.

The `--delete` flag on the assets pass removes files no longer in the build. Combined with versioning on the bucket, the previous versions stay recoverable for rollback.

`vars.CLOUDFRONT_DISTRIBUTION` is a repo-level variable (Settings → Secrets and variables → Actions → Variables). Distribution IDs aren't sensitive but they're per-environment, so this lets dev/staging/prod workflows share the file.

---

## API call routing — how same-origin works

Local dev: Vite dev server (`localhost:5173`) proxies `/api/*` to the BFF at `localhost:3000` (config in `vite.config.ts`). Browser sees everything as same-origin on `localhost:5173`.

Production: CloudFront does the same job. Browser sees everything as `huckleberry.com`. The `hb_session` cookie is set with `Domain=huckleberry.com`, `SameSite=Lax`, `Secure`, `HttpOnly` — and it works on both `/login` (S3) and `/api/auth/signin` (ALB) without CORS.

The `/api/*` behavior in CloudFront must:

- Use cache policy `CachingDisabled` — auth tokens, CSRF, SSE responses should never be cached.
- Use origin request policy `AllViewer` — forwards every header, cookie, and query parameter to the BFF.
- Forward `Host` set to the ALB's hostname (not `huckleberry.com`) — this is the default; only override if the BFF starts caring about the original Host.

---

## Observability

CloudFront access logs land in an S3 bucket (configure on the distribution). For day-to-day, the CloudFront console's "Reports & analytics" tab shows requests, bandwidth, and error rates.

Useful CloudWatch alarms:

| Alarm | Metric | Threshold |
|---|---|---|
| FE 5xx surge | CloudFront `5xxErrorRate` > 5% over 5 min | Page |
| FE 4xx surge | CloudFront `4xxErrorRate` > 50% over 5 min | Warn (could be a missing asset after a bad deploy) |
| Cache hit rate drop | CloudFront `CacheHitRate` < 80% over 10 min | Warn |

Most FE-side issues show up as 4xx (missing assets after a deploy) or 5xx (BFF being unreachable from the ALB origin). Real-User Monitoring (CloudWatch RUM, Datadog, Sentry — pick one) is the right tool for client-side errors; CloudFront logs only see what reached the edge.

---

## Rollback

Two paths, fast to slow:

1. **Bad deploy, last-good is still in the bucket as a prior version.**
   ```bash
   # List previous versions of index.html
   aws s3api list-object-versions --bucket huckleberry-fe-prod \
     --prefix index.html --max-keys 5

   # Promote a previous version to current
   aws s3api copy-object --bucket huckleberry-fe-prod \
     --copy-source "huckleberry-fe-prod/index.html?versionId=<PREV>" \
     --key index.html \
     --cache-control "public, max-age=60, must-revalidate"

   # Invalidate the edge
   aws cloudfront create-invalidation \
     --distribution-id <DIST_ID> --paths "/index.html"
   ```
   Same dance for the matching assets if hashed names changed.

2. **Total redeploy.** Check out the last-good commit, re-run the workflow with `workflow_dispatch`. Vite output is deterministic from a given commit + lockfile.

The first path is faster but requires you to know what changed. The second is foolproof.

---

## Cost estimate (rough, low traffic)

| Resource | Monthly |
|---|---|
| S3 storage (50 MB of bundles + versions) | $0.01 |
| S3 requests (100k GETs from CloudFront) | $0.04 |
| CloudFront (1 GB out + 200k requests) | $1.10 |
| CloudFront SSL via SNI (free with ACM) | $0 |
| Route 53 (1 hosted zone, queries) | $0.50 |
| ACM cert | $0 |
| **Total** | **~$2/month** |

CloudFront pricing is per-GB out + per 10k requests, so this scales linearly with traffic but stays cheap for SaaS-scale apps. The first 1 TB/month is around $85.
