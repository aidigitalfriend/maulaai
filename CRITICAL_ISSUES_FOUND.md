# 🚨 CRITICAL ISSUES FOUND - Environment & Stripe Configuration

**Date:** December 15, 2025  
**Status:** 🔴 ISSUES IDENTIFIED - Awaiting Fix Approval

---

## ❌ ISSUE 1: WRONG DOMAIN/API CONFIGURATION IN .ENV FILES

### Root .env File (/.env) - WRONG:

```env
# ❌ WRONG - Next.js doesn't need this
NEXT_PUBLIC_API_URL=https://onelastai.co/api

# ❌ WRONG - Unclear which service this is for
API_URL=https://onelastai.co
```

### Backend .env File (/backend/.env) - WRONG:

```env
# ❌ WRONG - VITE is for Vite.js framework, not Express
VITE_API_URL=https://onelastai.co/api

# ❌ WRONG - Should be BACKEND_PORT and FRONTEND_URL
API_URL=https://onelastai.co
```

---

## ✅ CORRECT CONFIGURATION SHOULD BE:

### Root .env (/.env):

```env
# Node Environment
NODE_ENV=production

# Application Ports
FRONTEND_PORT=3000
BACKEND_PORT=3005

# ❌ REMOVE: NEXT_PUBLIC_API_URL (not needed for Next.js)
# ❌ REMOVE: API_URL (unclear)

# MongoDB
MONGODB_URI=mongodb+srv://onelastai:onelastai-co@...
MONGODB_DB=onelastai

# Authentication
NEXTAUTH_SECRET=HMw7zuhLNvGqLFsBb2rVv5ZaWchais28CpIFsopUJ4U=
NEXTAUTH_URL=https://onelastai.co

# Security
ALLOWED_ORIGINS=https://onelastai.co,https://www.onelastai.co
```

### Backend .env (/backend/.env):

```env
# Application Settings
NODE_ENV=production
BACKEND_PORT=3005
APP_NAME=One Last AI

# ✅ ADD: Frontend URL for CORS
FRONTEND_URL=https://onelastai.co

# ❌ REMOVE: VITE_API_URL (wrong framework)
# ❌ REMOVE: API_URL (use FRONTEND_URL instead)

# All API keys, Stripe, MongoDB stay the same...
```

### Frontend .env (/frontend/.env):

```env
# ❌ REMOVE: NEXT_PUBLIC_API_URL (uses relative /api paths)

# ✅ ADD: Backend URL for Express calls
NEXT_PUBLIC_BACKEND_URL=https://onelastai.co:3005

# All other keys...
MONGODB_URI=...
STRIPE_SECRET_KEY=...
```

---

## ❌ ISSUE 2: INCOMPLETE STRIPE CONFIGURATION - ONLY 12 AGENTS

### Current State:

**✅ 12 Agents Fully Configured (6 IDs each = 72 total IDs):**

1. **julie-girlfriend** ✓

   - Daily: `prod_TbZO0rzMhIt9NJ` + `price_1SeMFLKFZS9GJlvabsNzQPSJ`
   - Weekly: `prod_TbZOafTW8O3IOz` + `price_1SeMFLKFZS9GJlvaYDMon8k6`
   - Monthly: `prod_TbZO7jC7Iyn0gu` + `price_1SeMFMKFZS9GJlvaGgm63W9i`

2. **emma-emotional** ✓

   - Daily: `prod_TbZOLRs2IAZT0c` + `price_1SeMFNKFZS9GJlvaWFJHto3g`
   - Weekly: `prod_TbZOWxYO8GtL0m` + `price_1SeMFNKFZS9GJlvaPzNJg8c2`
   - Monthly: `prod_TbZOdveFk20vi8` + `price_1SeMFOKFZS9GJlvafAkThVrg`

3. **einstein** ✓

   - Daily: `prod_TbZOhrgqynWRJR` + `price_1SeMFPKFZS9GJlvaRHTmzjCq`
   - Weekly: `prod_TbZO9ZgGiRT16q` + `price_1SeMFPKFZS9GJlvajH5lWJhH`
   - Monthly: `prod_TbZOCQ0Is4GkoZ` + `price_1SeMFQKFZS9GJlvaZbvmgngs`

4. **tech-wizard** ✓
5. **mrs-boss** ✓
6. **comedy-king** ✓
7. **chess-player** ✓
8. **fitness-guru** ✓
9. **travel-buddy** ✓
10. **drama-queen** ✓
11. **chef-biew** ✓
12. **professor-astrology** ✓

**Total Configured:** 12 agents × 6 IDs = **72 Stripe IDs** ✅

---

### ❌ 6 Agents MISSING Stripe Configuration:

13. **nid-gaming** ❌

    - Daily: ❌ MISSING PRODUCT ID + PRICE ID
    - Weekly: ❌ MISSING PRODUCT ID + PRICE ID
    - Monthly: ❌ MISSING PRODUCT ID + PRICE ID
    - **Currently:** Using julie-girlfriend fallback (WRONG!)

14. **ben-sega** ❌

    - Daily: ❌ MISSING
    - Weekly: ❌ MISSING
    - Monthly: ❌ MISSING

15. **bishop-burger** ❌

    - Daily: ❌ MISSING
    - Weekly: ❌ MISSING
    - Monthly: ❌ MISSING

16. **knight-logic** ❌

    - Daily: ❌ MISSING
    - Weekly: ❌ MISSING
    - Monthly: ❌ MISSING

17. **lazy-pawn** ❌

    - Daily: ❌ MISSING
    - Weekly: ❌ MISSING
    - Monthly: ❌ MISSING

18. **rook-jokey** ❌
    - Daily: ❌ MISSING
    - Weekly: ❌ MISSING
    - Monthly: ❌ MISSING

**Total Missing:** 6 agents × 6 IDs = **36 Stripe IDs needed** ❌

---

## 📊 WHAT'S NEEDED FOR COMPLETE CONFIGURATION

### Math Breakdown:

```
Total Agents: 18
Plans per Agent: 3 (daily, weekly, monthly)
IDs per Plan: 2 (1 product ID + 1 price ID)
Total IDs per Agent: 3 plans × 2 IDs = 6 IDs

Total IDs Needed: 18 agents × 6 IDs = 108 Stripe IDs
Currently Have: 12 agents × 6 IDs = 72 IDs
Still Need: 6 agents × 6 IDs = 36 IDs

Missing: 36 Stripe IDs (18 products + 18 prices)
```

---

## 🎯 REQUIRED ACTIONS

### For Issue #1 (Wrong Domain/API):

**Root .env:**

- [ ] Remove `NEXT_PUBLIC_API_URL=https://onelastai.co/api`
- [ ] Remove `API_URL=https://onelastai.co`
- [ ] Update `ALLOWED_ORIGINS` to production domains

**Backend .env:**

- [ ] Remove `VITE_API_URL=https://onelastai.co/api`
- [ ] Remove `API_URL=https://onelastai.co`
- [ ] Add `FRONTEND_URL=https://onelastai.co`
- [ ] Add `BACKEND_PORT=3005`

**Frontend .env:**

- [ ] Remove `NEXT_PUBLIC_API_URL` (if exists)
- [ ] Add `NEXT_PUBLIC_BACKEND_URL=https://onelastai.co:3005`

---

### For Issue #2 (Missing Stripe Products):

**Option A: Create Missing Products in Stripe Dashboard**

1. Login to Stripe Dashboard
2. Go to Products section
3. Create 6 new products (one per missing agent)
4. For each product, create 3 prices (daily $1, weekly $5, monthly $19)
5. Copy all 36 IDs (18 product IDs + 18 price IDs)
6. Add to both `/frontend/.env` and `/backend/.env`

**Option B: Hide Unconfigured Agents**

1. Update subscribe page to check if agent has Stripe products
2. Only show pricing cards for configured agents
3. Add "Coming Soon" badge for agents without products

**Option C: Keep Fallback (Current - NOT RECOMMENDED)**

- Users pay for julie-girlfriend but get different agent
- Confusing for users
- Revenue tracking is wrong
- Subscription records show wrong agent

---

## 📋 SUMMARY

### Issue #1: Environment Variables

- **Impact:** HIGH - Wrong configuration causes confusion
- **Fix Time:** 5 minutes
- **Files Affected:** 3 (.env files)

### Issue #2: Missing Stripe Products

- **Impact:** HIGH - 6 agents can't accept proper payments
- **Fix Time:** 2-3 hours (create products in Stripe)
- **IDs Needed:** 36 (18 products + 18 prices)

---

## 🚀 RECOMMENDED FIX ORDER

1. **Fix .env files first** (Quick - 5 minutes)

   - Remove wrong variables
   - Add correct ones
   - Deploy to production

2. **Create missing Stripe products** (2-3 hours)

   - Create in Stripe dashboard
   - Copy IDs to .env files
   - Update stripe-client.ts
   - Deploy to production

3. **Test complete flow**
   - Test all 18 agents
   - Verify payments work
   - Check subscription records

---

**READY TO FIX?**
Tell me:

1. Fix .env files first? (YES/NO)
2. Create Stripe products or hide agents? (CREATE/HIDE)
