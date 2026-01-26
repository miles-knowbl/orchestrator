# Monitoring Setup Reference

Effective post-deployment monitoring catches issues before users report them. This covers what to monitor, health checks, alerting, and logging.

## The Four Golden Signals

| Signal | What It Measures | Key Metric |
|--------|------------------|------------|
| Latency | Time to serve requests | p50, p95, p99 response time |
| Traffic | Demand on the system | Requests per second |
| Errors | Rate of failed requests | 5xx rate, error count |
| Saturation | Resource utilization | CPU, memory, disk, connections |

## Post-Deploy Metrics (First 30 Minutes)

| Metric | Alert If |
|--------|----------|
| Error rate (5xx) | >2x pre-deploy baseline |
| Response time p99 | >1.5x pre-deploy baseline |
| Active connections | >2x or <0.5x baseline |
| CPU utilization | >80% sustained |
| Memory usage | Increasing trend (leak) |
| Deployment version | Does not match expected |

## Health Check Endpoints

### Standard Response Format
```json
{
  "status": "ok",
  "version": "1.2.3",
  "commit": "abc1234",
  "timestamp": "2025-01-15T10:30:00Z",
  "checks": {
    "database": { "status": "ok", "latency_ms": 5 },
    "cache": { "status": "ok", "latency_ms": 2 }
  }
}
```

### Health Check Types

| Type | Path | Purpose | Frequency |
|------|------|---------|-----------|
| Liveness | `/healthz` | Process is running | Every 10s |
| Readiness | `/readyz` | Ready to accept traffic | Every 5s |
| Deep health | `/health` | All dependencies checked | Every 30s |
| Startup | `/startupz` | Initial boot complete | Every 5s until pass |

## Alerting Thresholds

### Severity Levels

| Level | Response Time | Who Gets Paged |
|-------|---------------|----------------|
| P1 - Critical | Immediate (< 5 min) | On-call engineer |
| P2 - High | < 30 min | On-call engineer |
| P3 - Medium | < 4 hours | Team channel |
| P4 - Low | Next business day | Team channel |

### Recommended Alert Rules

| Alert | Condition | Severity |
|-------|-----------|----------|
| Service Down | Health check fails 3 consecutive times | P1 |
| High Error Rate | 5xx rate > 5% for 5 minutes | P1 |
| Elevated Error Rate | 5xx rate > 1% for 10 minutes | P2 |
| High Latency | p99 > 3x baseline for 10 minutes | P2 |
| Memory Leak | Memory increasing >5%/hour | P3 |
| Disk Space | >85% used | P3 |
| Certificate Expiry | < 14 days remaining | P3 |

## Logging Best Practices

### Deployment Event Logs

| Event | Log Level | Key Fields |
|-------|-----------|------------|
| Deploy started | INFO | version, environment, deployer |
| Deploy completed | INFO | version, environment, duration |
| Deploy failed | ERROR | version, environment, error |
| Rollback initiated | WARN | from_version, to_version, reason |
| Health check failed | ERROR | check_name, consecutive_failures |
| Migration applied | INFO | migration_name, duration, rows_affected |

### Log Retention

| Environment | Retention |
|-------------|-----------|
| Production | 90 days (centralized) |
| Staging | 30 days |
| Development | 7 days |
| Audit logs | 1 year+ (immutable storage) |

## Dashboard Setup

### Deploy Dashboard Panels

| Panel | Visualization | Data Source |
|-------|---------------|-------------|
| Deploy timeline | Annotations on graphs | CI/CD events |
| Error rate (pre/post) | Time series with deploy markers | APM / logs |
| Response time percentiles | Time series (p50, p95, p99) | APM |
| Current version per instance | Table | Health check endpoints |
| Recent deploys | Table (version, time, status) | CI/CD |

### Platform-Specific Monitoring

| Platform | Built-in | Recommended Add-on |
|----------|----------|--------------------|
| Vercel | Analytics, Logs, Web Vitals | Sentry |
| Railway | Metrics, Logs | Betterstack or Datadog |
| AWS ECS | CloudWatch metrics + logs | X-Ray |
| Kubernetes | Metrics API | Prometheus + Grafana |

## Post-Deploy Monitoring Runbook

1. **T+0 min**: Confirm deploy succeeded (CI/CD green, version endpoint updated)
2. **T+2 min**: Check error rate is at or below pre-deploy baseline
3. **T+5 min**: Check latency p99 is within 1.5x baseline
4. **T+15 min**: Review logs for new error patterns or warnings
5. **T+30 min**: Confirm resource usage is stable (no memory leak, CPU spike)
6. **T+60 min**: All-clear -- deploy is considered stable
7. **If any check fails**: Follow rollback procedure, open incident
