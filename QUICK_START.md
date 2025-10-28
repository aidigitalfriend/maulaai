# 🚀 QUICK START - Production Deployment

## Copy & Paste Commands (In Order)

### 1️⃣ Connect to Server
```bash
ssh -i "one-last-ai.pem" ubuntu@ec2-18-138-34-220.ap-southeast-1.compute.amazonaws.com
```

### 2️⃣ Go to Project Directory
```bash
cd shiny-friend-disco
```

### 3️⃣ Edit Environment File
```bash
nano .env
```

### 4️⃣ Add These Critical Keys (Minimum Required)

```env
# Database (REQUIRED)
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/

# Security (REQUIRED)
NEXTAUTH_SECRET=FoJ9meTdOCakviaraP6GuAZUqyXmdNPE2QB/Y0VE9b0=

# AI Providers (At least 2 recommended)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=sk-your_openai_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
COHERE_API_KEY=your_cohere_api_key_here

# Email (REQUIRED for password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

**Save:** `Ctrl+X` → `Y` → `Enter`

### 5️⃣ Run Automated Deployment
```bash
bash scripts/deploy-production.sh
```

### 6️⃣ Check Status
```bash
pm2 status
pm2 logs
```

### 7️⃣ Configure AWS Security Group
1. Go to AWS EC2 Console
2. Select instance → Security tab
3. Edit inbound rules → Add:
   - HTTP (Port 80)
   - HTTPS (Port 443)
   - Custom TCP (Port 3000)
   - Source: 0.0.0.0/0

### 8️⃣ Access Your App
```
http://18.138.34.220:3000
```

---

## 📋 Essential PM2 Commands

```bash
pm2 status           # Check app status
pm2 logs             # View live logs
pm2 restart all      # Restart apps
pm2 stop all         # Stop apps
pm2 monit            # Dashboard
```

---

## 🔄 Update App (After Git Push)

```bash
cd shiny-friend-disco
git pull origin main
cd backend && npm install --legacy-peer-deps
cd ../frontend && npm install --legacy-peer-deps && npm run build
pm2 restart all
```

---

## ✅ Your Setup Status

- [x] Server configured ✅
- [x] Dependencies installed ✅
- [x] Scripts ready ✅
- [ ] API keys in .env ⚠️ **DO THIS NOW**
- [ ] App deployed ⚠️ **THEN THIS**
- [ ] Security group configured ⚠️ **THEN THIS**

---

## 🎯 AI Provider Status

- ✅ Gemini: 100% working (Primary)
- ✅ OpenAI: 100% working (Secondary)
- ✅ Mistral: 100% working (Fastest)
- ✅ Cohere: 67% working
- ⏸️ Anthropic: Add credits later

**Total: 12/15 models working (80%)**

---

## 🆘 Quick Troubleshooting

**Can't access from browser?**
→ Check AWS security group (port 3000 open?)

**PM2 shows error?**
→ Run: `pm2 logs` to see what's wrong

**MongoDB connection failed?**
→ Whitelist server IP in MongoDB Atlas

**Port 3000 busy?**
→ `pm2 delete all` then redeploy

---

## 📞 Server Info

**IP:** 18.138.34.220  
**SSH:** `ssh -i "one-last-ai.pem" ubuntu@ec2-18-138-34-220.ap-southeast-1.compute.amazonaws.com`  
**Location:** `/home/ubuntu/shiny-friend-disco`

---

**Time to complete:** 10-15 minutes  
**Difficulty:** Easy (mostly copy & paste)

**START NOW! 🚀**
