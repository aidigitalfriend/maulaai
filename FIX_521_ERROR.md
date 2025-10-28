# 🔧 Fix 521 Error - Quick Solution

## Problem
Your site shows **521 Web Server Is Down** because:
- ✅ DNS points to your server (18.138.34.220)
- ✅ Apps are running (backend + frontend)
- ✅ Nginx is listening on port 80
- ❌ Cloudflare expects HTTPS but your server only has HTTP

## ⚡ QUICK FIX (2 Minutes)

### Change Cloudflare SSL Mode to "Flexible"

1. Go to: https://dash.cloudflare.com
2. Select: **onelastai.co**
3. Go to: **SSL/TLS** → **Overview**
4. Change encryption mode from **"Full"** to **"Flexible"**
5. Wait 30 seconds
6. Visit: https://onelastai.co ✅

**What this does:**
- Visitor → Cloudflare: HTTPS ✅ (secure)
- Cloudflare → Your Server: HTTP ✅ (works now)

---

## 🔒 BETTER FIX (Optional - 10 Minutes)

### Add HTTPS Support to Your Server

If you want end-to-end encryption (Cloudflare → Server in HTTPS):

**Step 1: Generate Cloudflare Origin Certificate**

1. Go to: https://dash.cloudflare.com
2. Select: **onelastai.co**
3. Go to: **SSL/TLS** → **Origin Server**
4. Click: **Create Certificate**
5. Select:
   - Key type: **RSA (2048)**
   - Validity: **15 years**
   - Hostnames: **onelastai.co** and **www.onelastai.co**
6. Click: **Create**

7. **SAVE THESE TWO FILES:**
   - **Origin Certificate** (PEM format) - Copy all text
   - **Private Key** - Copy all text

**Step 2: Install Certificate on Server**

Run these commands:

```bash
# SSH into server
ssh -i "one-last-ai.pem" ubuntu@ec2-18-138-34-220.ap-southeast-1.compute.amazonaws.com

# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Create certificate file
sudo nano /etc/nginx/ssl/onelastai.co.crt
# PASTE the Origin Certificate, save with Ctrl+X, Y, Enter

# Create private key file
sudo nano /etc/nginx/ssl/onelastai.co.key
# PASTE the Private Key, save with Ctrl+X, Y, Enter

# Set secure permissions
sudo chmod 600 /etc/nginx/ssl/*
sudo chown root:root /etc/nginx/ssl/*
```

**Step 3: Update Nginx Configuration**

```bash
# Backup current config
sudo cp /etc/nginx/sites-available/onelastai.co /etc/nginx/sites-available/onelastai.co.backup

# Edit config
sudo nano /etc/nginx/sites-available/onelastai.co
```

Replace the entire content with:

```nginx
# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name onelastai.co www.onelastai.co;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name onelastai.co www.onelastai.co;

    # SSL Certificate
    ssl_certificate /etc/nginx/ssl/onelastai.co.crt;
    ssl_certificate_key /etc/nginx/ssl/onelastai.co.key;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Cloudflare real IP
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    real_ip_header CF-Connecting-IP;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Step 4: Test and Restart**

```bash
# Test configuration
sudo nginx -t

# If test passes, restart
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

**Step 5: Update Cloudflare SSL Mode**

1. Go to Cloudflare dashboard
2. SSL/TLS → Overview
3. Change to: **"Full (strict)"**
4. Wait 30 seconds
5. Visit: https://onelastai.co ✅

---

## ✅ Verification

After fixing, test:

```bash
# Check if port 443 is listening (if you did Option 2)
ssh -i "one-last-ai.pem" ubuntu@ec2-18-138-34-220.ap-southeast-1.compute.amazonaws.com "sudo ss -tlnp | grep :443"

# Test site
curl -I https://onelastai.co
```

---

## 🎯 Recommendation

**RIGHT NOW:** Do **Option 1 (Flexible SSL)** - Takes 2 minutes, site will work immediately

**LATER:** Do **Option 2 (Origin Certificate)** - Better security, but not urgent

---

## 📞 Current Server Status

✅ **Backend**: Online (port 3005)
✅ **Frontend**: Online (port 3000)
✅ **Nginx**: Active (port 80 only)
✅ **DNS**: Correct (18.138.34.220)
❌ **HTTPS**: Not configured yet

**After Option 1**: Your site will be live! 🚀
