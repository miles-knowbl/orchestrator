# DEPLOY.md Template

## Deployment Checklist: {{system-name}}

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Version bumped
- [ ] Changelog updated

### Environment
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Database migrations ready
- [ ] Secrets configured

### Deployment Steps
1. {{step-1}}
2. {{step-2}}
3. {{step-3}}

### Verification
- [ ] Service starts successfully
- [ ] Health check passes
- [ ] Smoke tests pass
- [ ] Logs show no errors

### Rollback Plan
If deployment fails:
1. {{rollback-step-1}}
2. {{rollback-step-2}}

### Post-Deployment
- [ ] Monitor logs for 15 minutes
- [ ] Check metrics dashboard
- [ ] Notify team

---

**Deployed by:** {{agent}}
**Deployed at:** {{timestamp}}
**Version:** {{version}}
