# Deployment Commands Reference

Platform-specific commands for the full deployment lifecycle: pre-checks, deploy, verify, and rollback.

## Pre-Deployment Checks

Run these before every deployment regardless of platform.

```bash
# Verify clean git state
git status --porcelain  # Should be empty
git log --oneline -3    # Confirm expected commits

# Run test suite
npm test                # or: cargo test, pytest, go test ./...

# Validate build succeeds locally
npm run build           # or: cargo build --release, docker build .
```

## Vercel Deployments

| Action | Command |
|--------|---------|
| Deploy preview | `vercel` |
| Deploy production | `vercel --prod` |
| List deployments | `vercel ls` |
| Inspect deployment | `vercel inspect <url>` |
| View logs | `vercel logs <url>` |
| Rollback | `vercel rollback` |
| Set env variable | `vercel env add <name> production` |
| Promote preview to prod | `vercel promote <deployment-url>` |

### Post-Deploy Verification
```bash
vercel ls --limit 1
curl -sf https://your-app.vercel.app/api/health | jq .
```

## Railway Deployments

| Action | Command |
|--------|---------|
| Deploy | `railway up` |
| Deploy specific service | `railway up --service <name>` |
| View logs | `railway logs` |
| View logs (follow) | `railway logs --follow` |
| Open dashboard | `railway open` |
| Set variable | `railway variables set KEY=value` |
| Link project | `railway link` |
| Check status | `railway status` |

### Post-Deploy Verification
```bash
railway status
railway logs --limit 50
curl -sf https://your-app.up.railway.app/health | jq .
```

## Docker Deployments

| Action | Command |
|--------|---------|
| Build image | `docker build -t app:latest .` |
| Build with tag | `docker build -t app:$(git rev-parse --short HEAD) .` |
| Push to registry | `docker push ghcr.io/org/app:latest` |
| Run container | `docker run -d --name app -p 3000:3000 app:latest` |
| View logs | `docker logs -f app` |
| Stop container | `docker stop app` |
| Inspect health | `docker inspect --format='{{.State.Health.Status}}' app` |

### Docker Compose
```bash
docker compose up -d --build              # Deploy with rebuild
docker compose up -d --no-deps --build <service>  # Single service
docker compose logs -f <service>          # View logs
```

## AWS Deployments

### ECS (Fargate)
```bash
aws ecs register-task-definition --cli-input-json file://task-def.json
aws ecs update-service --cluster <cluster> --service <service> \
  --task-definition <family>:<revision>
aws ecs describe-services --cluster <cluster> --services <service> \
  --query 'services[0].deployments'
```

### S3 + CloudFront (Static)
```bash
aws s3 sync ./dist s3://<bucket> --delete
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```

## Emergency Rollback Commands

| Platform | Rollback Command | Time |
|----------|-----------------|------|
| Vercel | `vercel rollback` | ~30s |
| Railway | Redeploy previous commit from dashboard | ~2min |
| Docker | `docker run -d app:<previous-tag>` | ~10s |
| K8s | `kubectl rollout undo deployment/<name>` | ~30s |
| ECS | Update service to previous task definition revision | ~3min |
| S3/CF | `aws s3 sync s3://<bucket-backup> s3://<bucket>` | ~1min |

### Rollback Verification
```bash
# 1. Service is responding
curl -sf <health-endpoint> | jq .status

# 2. Confirm rollback version
curl -sf <health-endpoint> | jq .version

# 3. Notify team
# Post in incident channel with: what happened, rollback status, next steps
```

## GitHub Actions Deploy Trigger

```bash
gh workflow run deploy.yml -f environment=production  # Trigger deploy
gh run list --workflow=deploy.yml --limit 3           # Check status
gh run view <run-id> --log                            # View logs
gh run cancel <run-id>                                # Cancel deploy
```

## Post-Deployment Verification Script

```bash
#!/bin/bash
URL="${1:?Usage: verify.sh <base-url>}"
PASS=0; TOTAL=0

check() {
  TOTAL=$((TOTAL + 1))
  if eval "$2" > /dev/null 2>&1; then
    echo "PASS: $1"; PASS=$((PASS + 1))
  else
    echo "FAIL: $1"
  fi
}

check "Health endpoint" "curl -sf ${URL}/health"
check "HTTP 200 on root" "curl -sf -o /dev/null -w '%{http_code}' ${URL} | grep 200"
check "Response time < 2s" "curl -sf -o /dev/null -w '%{time_total}' ${URL} | awk '{exit (\$1 > 2)}'"
check "Status OK" "curl -sf ${URL}/health | jq -e '.status == \"ok\"'"

echo "Results: ${PASS}/${TOTAL} passed"
[ "$PASS" -eq "$TOTAL" ] && exit 0 || exit 1
```
