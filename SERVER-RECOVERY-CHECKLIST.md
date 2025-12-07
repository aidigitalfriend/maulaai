# 🚨 Production Server Recovery Checklist

## Server Status: OFFLINE

**IP:** 47.129.43.231  
**Last Known Issue:** Server became unresponsive during Stripe webhook deployment

---

## 🔄 **Quick Recovery Steps (When Server Comes Back)**

### 1. **Test Connectivity**

```bash
# Test basic connectivity
ping -c 3 47.129.43.231

# Test SSH access
ssh -i one-last-ai.pem ubuntu@47.129.43.231 "uptime"

# Test website
curl -I https://onelastai.co
```

### 2. **Emergency Server Check**

```bash
ssh -i one-last-ai.pem ubuntu@47.129.43.231
```

Once connected, check:

```bash
# Check system resources
df -h          # Disk space
free -h        # Memory usage
top            # CPU usage

# Check services
pm2 status
sudo systemctl status nginx
sudo systemctl status mongodb

# Check logs
pm2 logs --lines 20
sudo tail -20 /var/log/nginx/error.log
```

### 3. **Quick Service Recovery**

```bash
# Restart services if needed
pm2 restart all
sudo systemctl restart nginx

# If MongoDB is down
sudo systemctl restart mongod
```

### 4. **Deploy Latest Subscription Fixes**

```bash
# Run automated setup (preferred)
./setup-production-ssh.sh

# OR manual setup:
cd ~/shiny-friend-disco

# Setup GitHub SSH
scp -i ~/one-last-ai.pem ~/.ssh/github_shiny-friend-disco ubuntu@47.129.43.231:~/.ssh/
scp -i ~/one-last-ai.pem ~/.ssh/github_shiny-friend-disco.pub ubuntu@47.129.43.231:~/.ssh/

# Configure and deploy
ssh -i ~/one-last-ai.pem ubuntu@47.129.43.231 << 'EOF'
chmod 600 ~/.ssh/github_shiny-friend-disco
git remote set-url origin git@github-shiny-friend-disco:aidigitalfriend/shiny-friend-disco.git
git pull origin main
sudo cp nginx/onelastai.co.conf /etc/nginx/sites-available/onelastai.co
sudo nginx -t && sudo systemctl reload nginx
pm2 restart all
EOF
```

### 5. **Verify Subscription System**

```bash
# Test endpoints
curl "https://onelastai.co/api/subscriptions/pricing"
curl -X POST "https://onelastai.co/api/webhooks/stripe" -H "Content-Type: application/json" -d '{"test":"webhook"}'
curl -X POST "https://onelastai.co/api/stripe/webhook" -H "Content-Type: application/json" -d '{"test":"webhook"}'
```

---

## 📋 **What's Ready for Deployment**

### ✅ **Completed & Committed:**

- SSH keys configured for GitHub private repository
- NGINX routing fixes for Stripe webhooks (`/api/stripe/` → frontend, `/api/webhooks/stripe` → backend)
- Backend Stripe webhook handler with proper error handling
- Subscription endpoints (pricing, check, create, cancel)
- Automatic deployment scripts

### 🔧 **Expected Results After Recovery:**

- Stripe webhooks: `https://onelastai.co/api/stripe/webhook` (frontend handler)
- Stripe webhooks backup: `https://onelastai.co/api/webhooks/stripe` (backend handler)
- Subscription pricing: `https://onelastai.co/api/subscriptions/pricing`
- Subscription check: `https://onelastai.co/api/subscriptions/check`

---

## 🆘 **If Server Won't Come Back**

### Possible Issues:

1. **Out of memory** - Stripe initialization might have caused memory spike
2. **Disk full** - Logs or temp files filled up disk
3. **Service crash loop** - PM2 processes crashing repeatedly
4. **Network configuration** - NGINX/firewall blocking connections

### Recovery Options:

1. **AWS Console** - Check EC2 instance status, reboot if needed
2. **System logs** - Check CloudWatch or system logs for errors
3. **Resource scaling** - Increase instance size if resource-constrained
4. **Fresh deployment** - Deploy to new instance if current one is corrupted

---

## 📞 **Emergency Contacts & Resources**

- **AWS Console:** Check EC2 instance status
- **GitHub Repo:** https://github.com/aidigitalfriend/shiny-friend-disco
- **Domain:** onelastai.co (via Cloudflare)
- **Latest Commit:** Subscription fixes + SSH setup scripts

---

_Last Updated: December 8, 2025_  
_Status: Server offline - awaiting recovery_
