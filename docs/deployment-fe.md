# Frontend deployment — AWS production

End-to-end runbook for getting the `huckleberry` SPA running in AWS, with a CD pipeline triggered by `git push`.

**Prereq:** laptop-side AWS access set up per the BFF's **`docs/aws-local-setup.md`** (AWS CLI, SSO profile). You should be able to run `aws sts get-caller-identity` against the target account before proceeding.

**Sibling doc:** `~/dev/huckleberry-server/docs/deployment-bff.md` — same shape, for the BFF.

## What you're standing up

```
      Route 53               CloudFront                       ALB
  huckleberry.ai  ──►  distribution (us-east-1 cert)  ──►  (BFF ingress)
                               │
                               ├── /* ──────────► S3 origin (SPA bundle)
                               │                  (OAC — no public bucket)
                               │
                               ├── /api/* ──────► ALB origin
                               └── /domo/* ─────► ALB origin
```

CloudFront is the only public endpoint. The S3 bucket is private — CloudFront authenticates via **Origin Access Control (OAC)**. All browser traffic to `huckleberry.ai` hits the same distribution, keeping `hb_session` cookies same-origin across the SPA and the API.

SPA routing: CloudFront returns `index.html` (HTTP 200) for any 403/404 from S3, so React Router handles client-side navigation normally.

---

## Environments

Naming pattern mirrors the BFF: `<env>-huckleberry-fe-*`.

| Env      | S3 bucket                          | CloudFront distribution |
| -------- | ---------------------------------- | ----------------------- |
| dev3     | `dev3-huckleberry-fe`              | TBD                     |
| staging  | `staging-huckleberry-fe`           | TBD                     |
| prod     | `huckleberry-fe`                   | TBD                     |

The doc uses `<env>` as a placeholder; substitute the actual prefix when running commands.

---

## One-time AWS setup

Done once per environment.

### 1. S3 bucket

```bash
ENV=dev3   # change per environment

aws s3api create-bucket \
  --bucket ${ENV}-huckleberry-fe \
  --region us-east-1

# Block all public access — CloudFront uses OAC, not a public bucket policy
aws s3api put-public-access-block \
  --bucket ${ENV}-huckleberry-fe \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Versioning lets you see prior deploys and roll back the object store
aws s3api put-bucket-versioning \
  --bucket ${ENV}-huckleberry-fe \
  --versioning-configuration Status=Enabled
```

No static website hosting config — objects are served through CloudFront, not the S3 website endpoint.

### 2. ACM certificate (us-east-1)

CloudFront requires the cert in **us-east-1** regardless of your distribution's origin region.

```bash
aws acm request-certificate \
  --domain-name huckleberry.ai \
  --subject-alternative-names "*.huckleberry.ai" \
  --validation-method DNS \
  --region us-east-1
```

Validate by adding the CNAME record ACM provides into Route 53. Standard 5–15 minute wait.

### 3. CloudFront distribution

Create the distribution with two origins — S3 for the SPA, ALB for the API.

First, create the OAC (one-time per account, reusable):

```bash
OAC_ID=$(aws cloudfront create-origin-access-control \
  --origin-access-control-config '{
    "Name": "huckleberry-fe-oac",
    "Description": "OAC for huckleberry S3 origin",
    "SigningProtocol": "sigv4",
    "SigningBehavior": "always",
    "OriginAccessControlOriginType": "s3"
  }' \
  --query 'OriginAccessControl.Id' --output text)
echo "OAC ID: $OAC_ID"
```

Then create the distribution (replace `<ACCT>`, `<ALB_DNS>`, `<CERT_ARN>`, `<OAC_ID>`):

```bash
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "huckleberry-fe-1",
  "Comment": "huckleberry SPA + BFF",
  "Enabled": true,
  "HttpVersion": "http2and3",
  "PriceClass": "PriceClass_100",
  "Aliases": { "Quantity": 1, "Items": ["huckleberry.ai"] },
  "ViewerCertificate": {
    "ACMCertificateArn": "<CERT_ARN>",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "Origins": {
    "Quantity": 2,
    "Items": [
      {
        "Id": "s3-spa",
        "DomainName": "<ENV>-huckleberry-fe.s3.us-east-1.amazonaws.com",
        "S3OriginConfig": { "OriginAccessIdentity": "" },
        "OriginAccessControlId": "<OAC_ID>"
      },
      {
        "Id": "alb-bff",
        "DomainName": "<ALB_DNS>",
        "CustomOriginConfig": {
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only",
          "OriginSSLProtocols": { "Quantity": 1, "Items": ["TLSv1.2"] }
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "s3-spa",
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "Compress": true,
    "AllowedMethods": { "Quantity": 2, "Items": ["GET", "HEAD"], "CachedMethods": { "Quantity": 2, "Items": ["GET", "HEAD"] } }
  },
  "CacheBehaviors": {
    "Quantity": 2,
    "Items": [
      {
        "PathPattern": "/api/*",
        "TargetOriginId": "alb-bff",
        "ViewerProtocolPolicy": "https-only",
        "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
        "OriginRequestPolicyId": "b689b0a8-53d0-40ab-baf2-68738e2966ac",
        "AllowedMethods": { "Quantity": 7, "Items": ["GET","HEAD","OPTIONS","PUT","PATCH","POST","DELETE"], "CachedMethods": { "Quantity": 2, "Items": ["GET","HEAD"] } },
        "Compress": true
      },
      {
        "PathPattern": "/domo/*",
        "TargetOriginId": "alb-bff",
        "ViewerProtocolPolicy": "https-only",
        "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
        "OriginRequestPolicyId": "b689b0a8-53d0-40ab-baf2-68738e2966ac",
        "AllowedMethods": { "Quantity": 7, "Items": ["GET","HEAD","OPTIONS","PUT","PATCH","POST","DELETE"], "CachedMethods": { "Quantity": 2, "Items": ["GET","HEAD"] } },
        "Compress": true
      }
    ]
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      { "ErrorCode": 403, "ResponseCode": "200", "ResponsePagePath": "/index.html", "ErrorCachingMinTTL": 0 },
      { "ErrorCode": 404, "ResponseCode": "200", "ResponsePagePath": "/index.html", "ErrorCachingMinTTL": 0 }
    ]
  }
}'
```

Cache policy IDs used above (AWS managed):
- `658327ea-...` — **CachingOptimized** (default S3 behavior; uses `Cache-Control` headers)
- `4135ea2d-...` — **CachingDisabled** (API paths — no caching at all)
- `b689b0a8-...` — **AllViewerExceptHostHeader** origin request policy (forwards cookies + query strings to the ALB)

After creating the distribution, note the **Distribution ID** and **CloudFront domain name** (`*.cloudfront.net`).

### 4. S3 bucket policy (allow CloudFront OAC)

```bash
DIST_ARN="arn:aws:cloudfront::<ACCT>:distribution/<DIST_ID>"

aws s3api put-bucket-policy \
  --bucket ${ENV}-huckleberry-fe \
  --policy "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [{
      \"Sid\": \"AllowCloudFrontOAC\",
      \"Effect\": \"Allow\",
      \"Principal\": { \"Service\": \"cloudfront.amazonaws.com\" },
      \"Action\": \"s3:GetObject\",
      \"Resource\": \"arn:aws:s3:::${ENV}-huckleberry-fe/*\",
      \"Condition\": {
        \"StringEquals\": {
          \"AWS:SourceArn\": \"$DIST_ARN\"
        }
      }
    }]
  }"
```

### 5. Route 53 alias

Create an A record (alias) pointing `huckleberry.ai` at the CloudFront distribution. CloudFront's hosted zone ID is always `Z2FDTNDATAQYW2`:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id <HOSTED_ZONE_ID> \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "huckleberry.ai",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "<CLOUDFRONT_DOMAIN>.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

### 6. IAM: deploy role assumed by the FE workflow

Same OIDC pattern as the BFF role. Trust policy scoped to the frontend repo:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:domo-development/huckleberry:*"
      }
    }
  }]
}
```

Permissions — the deploy role only needs to push files to S3 and invalidate the distribution:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Sync",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::<ENV>-huckleberry-fe",
        "arn:aws:s3:::<ENV>-huckleberry-fe/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidate",
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DIST_ID>"
    }
  ]
}
```

---

## Build output

The Vite config writes the production bundle to `build/`. The deploy syncs that directory to S3.

Asset hashing: Vite appends content hashes to JS/CSS filenames (e.g. `assets/index-BhGt3kF9.js`), so assets can be cached with a long TTL. `index.html` itself should have a short or no-cache TTL — it's the entry point that references the hashed assets.

Set cache headers via S3 metadata on sync:

```bash
# Long TTL for hashed assets (1 year)
aws s3 sync build/ s3://${ENV}-huckleberry-fe/ \
  --exclude "index.html" \
  --cache-control "public,max-age=31536000,immutable"

# No-cache for index.html (browsers must revalidate)
aws s3 cp build/index.html s3://${ENV}-huckleberry-fe/index.html \
  --cache-control "no-cache,no-store,must-revalidate"
```

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
  AWS_REGION: us-east-1
  S3_BUCKET: dev3-huckleberry-fe        # override per env via workflow_dispatch input or branch matrix
  CLOUDFRONT_DIST_ID: <DIST_ID>

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
        env:
          DOMO_API_BASE_URL: https://huckleberry.ai   # adjust per env

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::<ACCT>:role/huckleberry-fe-deploy
          aws-region: ${{ env.AWS_REGION }}

      - name: Sync hashed assets (long TTL)
        run: |
          aws s3 sync build/ s3://${{ env.S3_BUCKET }}/ \
            --exclude "index.html" \
            --cache-control "public,max-age=31536000,immutable" \
            --delete

      - name: Upload index.html (no-cache)
        run: |
          aws s3 cp build/index.html s3://${{ env.S3_BUCKET }}/index.html \
            --cache-control "no-cache,no-store,must-revalidate"

      - name: Invalidate CloudFront (index.html only)
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ env.CLOUDFRONT_DIST_ID }} \
            --paths "/index.html"
```

The invalidation targets only `index.html` — hashed assets never need invalidation because any change produces a new filename. This keeps invalidation costs near zero (CloudFront charges per path beyond 1000/month).

---

## First manual deploy (smoke test before CD)

```bash
cd ~/dev/huckleberry

# Build
pnpm build

# Auth
aws sso login --profile <PROFILE>

# Sync
ENV=dev3
DIST_ID=<DIST_ID>

aws s3 sync build/ s3://${ENV}-huckleberry-fe/ \
  --exclude "index.html" \
  --cache-control "public,max-age=31536000,immutable" \
  --delete

aws s3 cp build/index.html s3://${ENV}-huckleberry-fe/index.html \
  --cache-control "no-cache,no-store,must-revalidate"

# Invalidate
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/index.html"

# Smoke — wait ~30s for the invalidation to propagate
curl -I https://huckleberry.ai
```

---

## Rollback

Because Vite hashes every asset filename, every deploy leaves the previous version's files in S3 intact until `--delete` removes them. To roll back:

1. Find the previous `index.html` in S3 version history:
   ```bash
   aws s3api list-object-versions --bucket ${ENV}-huckleberry-fe --prefix index.html
   ```
2. Restore it by copying the desired version ID back:
   ```bash
   aws s3api copy-object \
     --bucket ${ENV}-huckleberry-fe \
     --copy-source "${ENV}-huckleberry-fe/index.html?versionId=<VERSION_ID>" \
     --key index.html \
     --metadata-directive REPLACE \
     --cache-control "no-cache,no-store,must-revalidate"
   ```
3. Invalidate:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id $DIST_ID --paths "/index.html"
   ```

The restored `index.html` references the old asset hashes, which are still in the bucket — so the rollback is instant and doesn't require a rebuild.

---

## Cost estimate (rough, us-east-1, low traffic)

| Resource                              | Monthly  |
| ------------------------------------- | -------- |
| S3 storage (100 MB bundle, versioned) | < $0.01  |
| S3 GET requests (~50k/mo)             | $0.02    |
| CloudFront (10 GB data out, 1M reqs)  | $1–5     |
| Route 53 hosted zone                  | $0.50    |
| ACM cert                              | free     |
| CloudFront invalidations (< 1000/mo)  | free     |
| **Total**                             | **~$2–6** |
