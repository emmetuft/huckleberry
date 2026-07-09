# Frontend deployment — dev3 (EKS container)

The frontend runs as a Docker container (nginx serving the Vite build) in EKS alongside the BFF pod. Deployments are triggered by merging to `master`.

---

## Deploy flow

1. **Merge a PR to `master`** — `build-huckleberry-ui.yml` triggers on push to `master` for changes under `src/`, `public/`, `package.json`, `pnpm-lock.yaml`, `Dockerfile`, `nginx.conf`, or `vite.config.*`.

2. **Note the image tag** — the workflow tags the image `YYYY-MM-DD-bN` (e.g. `2026-07-08-b7`). Find it in the GitHub Actions run output or ECR (`huckleberry/huckleberry-frontend`).

3. **Update gitops** — in `~/dev/huckleberry-gitops`, bump `instances/dev-ai/dev3/values.yaml`:
   ```yaml
   frontend:
     image:
       tag: "2026-07-08-b7"   # replace with actual tag from step 2
   ```
   Commit and push on the active feature branch, then merge to `master` in gitops.

4. **ArgoCD syncs** — the dev3 app auto-syncs within a few minutes. Rolling restart; no manual intervention needed unless the sync is stalled.

---

## Verify

```bash
# BFF health (confirms pods are up)
curl https://huckleberry-dev.domotech.io/health
# expected: {"status":"ok"}

# Check running image tag (requires kubectl cluster access)
kubectl get pods -n <namespace> -o jsonpath='{.items[*].spec.containers[*].image}' \
  | tr ' ' '\n' | grep huckleberry-frontend
```

---

## Rollback

Update `values.yaml` in gitops to the previous tag and push. ArgoCD rolls the pod back automatically.
