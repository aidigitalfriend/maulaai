# 🔐 AUTHORIZATION & PATH SECURITY ANALYSIS
## Generated: November 20, 2025

---

## 📍 **PATH CONFIGURATION STATUS**

### ✅ **WORKING PATHS**

| Environment | Base Path | Status |
|-------------|-----------|--------|
| **Development (macOS)** | `/Users/onelastai/Library/CloudStorage/GoogleDrive-...` | ✅ WORKING |
| **Production (EC2)** | `/home/ubuntu/shiny-friend-disco` | ✅ CONFIGURED |

---

## 🚨 **CRITICAL ISSUES IDENTIFIED**

### 1. **Google Drive Sync Location** ⚠️

**Current Setup:**
```
/Users/onelastai/Library/CloudStorage/GoogleDrive-chaudharyshahbazgill@gmail.com/My Drive/shiny-friend-disco
```

**Risks:**
- 🔴 **Google Drive sync conflicts** with `node_modules/` (150MB+)
- 🔴 **`.next/` build cache** syncing wastes bandwidth
- 🔴 **File locking issues** during active builds
- 🔴 **Version control confusion** (Git + GDrive)

**Recommended Action:**
```bash
# Option 1: Move to local path (RECOMMENDED)
sudo mv "/Users/onelastai/Library/CloudStorage/GoogleDrive-chaudharyshahbazgill@gmail.com/My Drive/shiny-friend-disco" \
        ~/Projects/shiny-friend-disco

cd ~/Projects/shiny-friend-disco

# Option 2: Exclude from Google Drive sync
# Add to Google Drive preferences: Exclude these folders
- node_modules/
- .next/
- .git/
- frontend/node_modules/
- backend/node_modules/
- frontend/.next/
- backend/.next/
```

---

### 2. **Missing Environment Files** 🔴

**Fixed Issues:**
- ✅ Created root `.env` file
- ✅ Backend `.env` exists
- ✅ Frontend `.env` exists

**Next Steps:**
1. Copy actual API keys to `.env` files:
```bash
# Backend keys
cd backend
nano .env
# Add: OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.

# Frontend keys  
cd ../frontend
nano .env
# Add: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, etc.
```

2. **Never commit** `.env` files to Git (already in `.gitignore`)

---

### 3. **API Routing Authorization** ⚠️

**Current Setup:**

```typescript
// Multiple API base URLs in codebase
frontend/lib/ai-service.ts          → http://localhost:3005
frontend/lib/agent-api-helper.ts     → http://localhost:3005
frontend/lib/multimodal-ai-client.ts → Uses NEXT_PUBLIC_API_URL
```

**Issue:** Inconsistent URL resolution between:
- **Local dev**: Direct to backend:3005
- **Production**: Through Nginx proxy

**Solution Implemented:**
```bash
# Root .env now centralizes:
NEXT_PUBLIC_API_URL=http://localhost:3005  # Dev
# Production: NEXT_PUBLIC_API_URL=https://onelastai.co/api
```

---

### 4. **Nginx Authorization & Routing** 🟡

**Production Nginx Config:**
```nginx
# Backend APIs (require internal auth)
/api/chat              → 127.0.0.1:3005
/api/agents/*          → 127.0.0.1:3005  
/api/doctor-network/*  → 127.0.0.1:3005
/api/emotional-tts     → 127.0.0.1:3005

# Frontend APIs (Next.js internal)
/api/community/*       → 127.0.0.1:3000
/api/tools/*           → 127.0.0.1:3000
/api/status            → 127.0.0.1:3000 (also backend)
```

**Authorization Flow:**
1. **Cloudflare** → Validates SSL, blocks attacks
2. **Nginx** → Routes by path, rate limits
3. **Backend** → JWT/API key validation
4. **Frontend** → Next.js middleware auth

**Missing Security:**
- ❌ No API key validation on `/api/chat` endpoint
- ❌ No rate limiting per user (only per IP)
- ❌ No request signing between frontend/backend

**Recommended Additions:**
```javascript
// backend/middleware/auth.js
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Apply to backend routes
app.use('/api/agents/*', validateApiKey);
app.use('/api/chat', validateApiKey);
```

```typescript
// frontend/lib/ai-service.ts
const response = await fetch(`${API_BASE_URL}/api/chat`, {
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.NEXT_PUBLIC_INTERNAL_API_KEY, // Add this
  },
  // ...
});
```

---

### 5. **PM2 Process Authorization** 🟢

**Current Status:**
```bash
# PM2 runs as 'ubuntu' user on EC2
pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Processes:
- shiny-frontend (port 3000) → ubuntu user
- shiny-backend  (port 3005) → ubuntu user
```

**Security Posture:**
- ✅ Non-root user execution
- ✅ Process isolation
- ✅ Auto-restart on failure
- ✅ Log rotation enabled

**No issues found** - this is properly configured.

---

### 6. **MongoDB Authorization** ⚠️

**Current Setup:**
```bash
# .env.example
MONGODB_URI=mongodb://username:password@localhost:27017/mydb
```

**Issues:**
- ⚠️ Using basic username/password auth
- ⚠️ No TLS encryption for local connections
- ⚠️ MongoDB exposed on all interfaces (default)

**Recommended Security:**
```bash
# 1. Enable MongoDB authentication
sudo nano /etc/mongod.conf
---
security:
  authorization: enabled

# 2. Create admin user
mongo
use admin
db.createUser({
  user: "onelastai_admin",
  pwd: "STRONG_PASSWORD_HERE",
  roles: [ { role: "root", db: "admin" } ]
})

# 3. Create app-specific user
use onelastai
db.createUser({
  user: "app_user",
  pwd: "APP_PASSWORD_HERE", 
  roles: [ { role: "readWrite", db: "onelastai" } ]
})

# 4. Update .env
MONGODB_URI=mongodb://app_user:APP_PASSWORD_HERE@localhost:27017/onelastai?authSource=onelastai
```

---

### 7. **File Permissions Audit** 🟢

**Current Permissions:**
```bash
drwx------  # Root directory (onelastai only)
-rw-------  # .env files (owner read/write only)
drwx------  # node_modules, .next (owner only)
```

**Status:** ✅ **SECURE** - Proper restrictive permissions

---

## 🛡️ **AUTHORIZATION MATRIX**

| Resource | Dev Access | Prod Access | Auth Method |
|----------|-----------|-------------|-------------|
| **MongoDB** | localhost:27017 | localhost:27017 | Username/Password |
| **Backend API** | localhost:3005 | Nginx proxy | None (ADD JWT) |
| **Frontend** | localhost:3000 | Nginx proxy | NextAuth |
| **Nginx Config** | N/A | Root SSH | SSH key |
| **PM2 Logs** | N/A | ubuntu user | File permissions |
| **Environment Files** | Owner only | Owner only | File permissions |

---

## ✅ **FIXES IMPLEMENTED**

1. ✅ Created root `.env` file with centralized config
2. ✅ Created `path-config.js` for auto-detection
3. ✅ Updated `ecosystem.config.js` to use dynamic paths
4. ✅ Documented all authorization issues

---

## 🚀 **NEXT STEPS (PRIORITY ORDER)**

### **CRITICAL** 🔴
1. **Move project out of Google Drive** to local `~/Projects/`
2. **Add API key validation** between frontend and backend
3. **Enable MongoDB authentication** on production server

### **HIGH** 🟡  
4. **Implement JWT tokens** for user API requests
5. **Add rate limiting** per user (not just IP)
6. **Set up SSL certs** for local development (mkcert)

### **MEDIUM** 🟢
7. **Add request signing** for internal API calls
8. **Implement API key rotation** system
9. **Set up monitoring** for unauthorized access attempts

### **LOW** ⚪
10. **Add 2FA** for production SSH access
11. **Implement audit logging** for all API calls
12. **Set up Cloudflare Access** for admin routes

---

## 📋 **TESTING CHECKLIST**

Before deploying authorization changes:

```bash
# 1. Test path detection
node path-config.js

# 2. Verify environment loading
cd backend && node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"

# 3. Test PM2 startup
pm2 delete all
pm2 start ecosystem.config.js
pm2 logs

# 4. Test API endpoints
curl http://localhost:3005/health
curl http://localhost:3005/api/status

# 5. Test frontend connection
curl http://localhost:3000/api/status
```

---

## 📞 **SUPPORT CONTACTS**

| Issue | Contact |
|-------|---------|
| **Path/Deployment Issues** | GitHub Copilot / CI/CD team |
| **Security/Auth Issues** | Security team / DevSecOps |
| **MongoDB Access** | DBA team |
| **EC2/AWS Issues** | Cloud infrastructure team |

---

**Document Status:** ✅ Complete and Ready for Implementation
**Last Updated:** November 20, 2025
**Next Review:** After implementing Critical fixes
