# 🚀 QUICK START DEPLOYMENT GUIDE

## Your AWS EC2 Production Setup - Ultra Quick Reference

---

## 📦 What You Got

1. ✅ **PRODUCTION_DEPLOYMENT_GUIDE.md** - Complete step-by-step guide (15 sections)
2. ✅ **scripts/ec2-setup.sh** - Ubuntu EC2 initial setup script
3. ✅ **scripts/deploy.sh** - Automated deployment script
4. ✅ **ecosystem.config.js** - PM2 process manager configuration
5. ✅ **nginx/onelastai.co.conf** - Nginx reverse proxy config
6. ✅ **.env.production.frontend.template** - Frontend environment variables
7. ✅ **.env.production.backend.template** - Backend environment variables

---

## ⚡ 5-MINUTE DEPLOYMENT (If Everything's Ready)

### **Prerequisites Checklist:**
```
☐ AWS EC2 t3.small running Ubuntu 22.04
☐ Elastic IP assigned to EC2
☐ Cloudflare DNS pointing to Elastic IP
☐ MongoDB connection string ready
☐ All API keys collected
☐ SSH access to EC2 configured
```

### **Step 1: Initial EC2 Setup** (One-time)
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Upload and run setup script
wget https://raw.githubusercontent.com/YOUR_REPO/shiny-friend-disco/main/scripts/ec2-setup.sh
chmod +x ec2-setup.sh
./ec2-setup.sh

# Add SSH key to GitHub (shown in script output)
```

### **Step 2: Clone & Configure**
```bash
# Clone repository
cd /var/www/shiny-friend-disco
git clone YOUR_GITHUB_REPO .

# Copy environment templates
cp .env.production.backend.template backend/.env
cp .env.production.frontend.template frontend/.env

# Edit environment files (nano or vim)
nano backend/.env  # Fill in ALL values
nano frontend/.env # Fill in public values
```

### **Step 3: Configure Nginx**
```bash
# Copy Nginx config
sudo cp nginx/onelastai.co.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/onelastai.co /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### **Step 4: Get SSL Certificate**
```bash
sudo certbot certonly --webroot \
    -w /var/www/certbot \
    -d onelastai.co \
    -d www.onelastai.co \
    --email your-email@example.com \
    --agree-tos

sudo systemctl reload nginx
```

### **Step 5: Deploy Application**
```bash
# Install dependencies & build
npm install
cd frontend && npm install && npm run build && cd ..
cd backend && npm install && cd ..

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs
```

### **Step 6: Verify**
```bash
# Test locally
curl http://localhost:3000  # Frontend
curl http://localhost:3005/health  # Backend

# Test production
curl https://onelastai.co
```

---

## 🔧 COMMON COMMANDS

### **Deployment:**
```bash
cd /var/www/shiny-friend-disco
./scripts/deploy.sh
```

### **PM2 Management:**
```bash
pm2 status              # Check status
pm2 logs                # View logs
pm2 restart all         # Restart all
pm2 monit               # Real-time monitor
pm2 stop all            # Stop all
```

### **Nginx:**
```bash
sudo nginx -t                              # Test config
sudo systemctl reload nginx                 # Reload
sudo systemctl restart nginx                # Restart
sudo tail -f /var/log/nginx/onelastai.co-error.log
```

### **SSL Certificate:**
```bash
sudo certbot certificates                   # Check status
sudo certbot renew                          # Renew
```

### **Logs:**
```bash
pm2 logs shiny-frontend                     # Frontend logs
pm2 logs shiny-backend                      # Backend logs
sudo tail -f /var/log/nginx/onelastai.co-access.log
```

---

## 🔐 ENVIRONMENT VARIABLES QUICK CHECKLIST

### **Backend (.env) - 18 Required:**
```
✅ JWT_SECRET (generate with: openssl rand -base64 64)
✅ NEXTAUTH_SECRET (generate with: openssl rand -base64 64)
✅ MONGODB_URI (MongoDB Atlas connection string)
✅ OPENAI_API_KEY
✅ ANTHROPIC_API_KEY
✅ GEMINI_API_KEY
✅ COHERE_API_KEY
✅ ELEVENLABS_API_KEY
✅ GOOGLE_TRANSLATE_API_KEY
✅ AZURE_SPEECH_KEY
✅ AZURE_SPEECH_REGION
✅ SENDGRID_API_KEY
✅ STRIPE_SECRET_KEY
✅ STRIPE_WEBHOOK_SECRET
✅ PAYPAL_CLIENT_ID
✅ PAYPAL_CLIENT_SECRET
✅ AWS_ACCESS_KEY_ID
✅ AWS_SECRET_ACCESS_KEY
```

### **Frontend (.env) - 3 Required:**
```
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
✅ NEXT_PUBLIC_PAYPAL_CLIENT_ID
✅ NEXT_PUBLIC_APP_URL (https://onelastai.co)
```

---

## 🚨 TROUBLESHOOTING

### **502 Bad Gateway**
```bash
pm2 status                    # Check if apps running
pm2 restart all               # Restart apps
sudo systemctl restart nginx  # Restart Nginx
```

### **PM2 App Crashed**
```bash
pm2 logs shiny-backend        # Check error logs
cd /var/www/shiny-friend-disco/backend
cat .env | grep MONGODB_URI   # Verify env vars
```

### **SSL Certificate Error**
```bash
sudo certbot certificates     # Check cert status
sudo certbot renew --dry-run  # Test renewal
```

### **Build Failed**
```bash
cd /var/www/shiny-friend-disco/frontend
rm -rf .next node_modules
npm install
npm run build
```

---

## 📊 MONITORING

### **Real-time Monitoring:**
```bash
pm2 monit                     # PM2 dashboard
htop                          # System resources
```

### **Health Checks:**
```bash
curl http://localhost:3005/health    # Backend
curl http://localhost:3000           # Frontend
curl https://onelastai.co            # Production
```

### **Check Disk Space:**
```bash
df -h
du -sh /var/www/shiny-friend-disco/*
```

---

## 🔄 UPDATING APPLICATION

### **Method 1: Using Deploy Script (Recommended)**
```bash
cd /var/www/shiny-friend-disco
./scripts/deploy.sh
```

### **Method 2: Manual Update**
```bash
cd /var/www/shiny-friend-disco
git pull origin main
npm install
cd frontend && npm install && npm run build && cd ..
cd backend && npm install && cd ..
pm2 restart all
```

---

## 📞 EMERGENCY CONTACTS

### **Critical Files:**
- Logs: `/var/log/pm2/` and `/var/log/nginx/`
- App: `/var/www/shiny-friend-disco/`
- Nginx: `/etc/nginx/sites-available/onelastai.co`
- SSL: `/etc/letsencrypt/live/onelastai.co/`

### **Recovery Commands:**
```bash
# Full restart
pm2 restart all && sudo systemctl restart nginx

# Check everything
pm2 status && sudo systemctl status nginx && sudo ufw status

# View all logs
pm2 logs && sudo tail -100 /var/log/nginx/onelastai.co-error.log
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

```
☐ https://onelastai.co loads successfully
☐ SSL certificate is valid (green lock)
☐ All 18 AI agents working
☐ User signup/login working
☐ Payment flows tested (Stripe + PayPal)
☐ File uploads working (S3)
☐ Email sending working (Auth.js)
☐ PM2 processes stable (pm2 status)
☐ Nginx logs clean
☐ SSL auto-renewal configured
☐ Firewall configured (UFW)
☐ Backups scheduled
☐ Monitoring alerts set up
```

---

## 🎯 PERFORMANCE TIPS

1. **Enable Redis** for rate limiting (multi-server support)
2. **Use Cloudflare caching** aggressively
3. **Enable Nginx caching** for static assets
4. **Set up CDN** for S3 assets (CloudFront)
5. **Monitor memory** with `pm2 monit`
6. **Rotate logs** with PM2 log rotation

---

## 📚 FULL DOCUMENTATION

For complete details, see: **PRODUCTION_DEPLOYMENT_GUIDE.md**

**Estimated Total Setup Time:** 2-3 hours (first time)  
**Estimated Deploy Time:** 5-10 minutes (after setup)

---

**Status:** ✅ Production Ready  
**Last Updated:** 2025-01-28  
**Version:** 1.0.0

🚀 **You're all set! Deploy with confidence!**
