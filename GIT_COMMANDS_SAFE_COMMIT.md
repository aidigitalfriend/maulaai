# 🔒 SAFE GIT COMMANDS - PREVENT COMMITTING SENSITIVE FILES

## ⚠️ CRITICAL: Run These Commands Before Pushing

Your `backend/.env` contains **real API keys and secrets**. Follow these steps to ensure they're never committed.

---

## ✅ Step 1: Verify .gitignore is Working

```bash
# Check what git will commit (should NOT show .env files)
git status

# If you see backend/.env or frontend/.env listed, STOP and continue to Step 2
```

---

## 🚨 Step 2: Remove Sensitive Files from Git Tracking (If Already Tracked)

**If git status shows `.env` files or `APIKEYS.md`, run these commands:**

```bash
# Remove from git tracking (keeps local file)
git rm --cached backend/.env
git rm --cached frontend/.env
git rm --cached APIKEYS.md

# If you have other sensitive files showing:
git rm --cached *.pem
git rm --cached *.key
```

---

## ✅ Step 3: Commit .gitignore Updates

```bash
# Stage the updated .gitignore
git add .gitignore

# Commit with descriptive message
git commit -m "chore: update .gitignore to block sensitive files and API keys"
```

---

## 🔍 Step 4: Double-Check Before Pushing

```bash
# Verify no sensitive files in the commit
git diff HEAD~1

# Check the commit contents
git show HEAD

# List all tracked files (should NOT include .env)
git ls-files | grep -E '\\.env|\\.pem|\\.key|APIKEYS'

# If the above returns nothing, you're safe!
```

---

## 🚀 Step 5: Push to GitHub

```bash
# Push to main branch
git push origin main
```

---

## 🧹 BONUS: Remove Sensitive Files from Git History (If Already Committed)

**⚠️ WARNING: This rewrites history. Coordinate with your team first!**

### Option A: Using git filter-repo (Recommended)

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove files from entire history
git filter-repo --path backend/.env --invert-paths
git filter-repo --path frontend/.env --invert-paths
git filter-repo --path APIKEYS.md --invert-paths

# Force push (rewrites history)
git push origin main --force
```

### Option B: Using BFG Repo-Cleaner (Faster for large repos)

```bash
# Download BFG: https://rtyley.github.io/bfg-repo-cleaner/

# Remove sensitive files
java -jar bfg.jar --delete-files "*.env"
java -jar bfg.jar --delete-files "APIKEYS.md"

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin main --force
```

---

## 🔐 Step 6: Rotate Compromised API Keys

**If you've already pushed sensitive keys to GitHub, assume they're compromised.**

### Keys to Rotate Immediately:

1. **OpenAI**: https://platform.openai.com/api-keys
2. **Google Gemini**: https://ai.google.dev
3. **Anthropic Claude**: https://console.anthropic.com
4. **Cohere**: https://dashboard.cohere.com
5. **AWS**: https://console.aws.amazon.com/iam/
6. **Stripe**: https://dashboard.stripe.com/apikeys
7. **PayPal**: https://developer.paypal.com/
8. **MongoDB**: https://cloud.mongodb.com/
9. **All others in your .env file**

### How to Rotate:

1. Log into each service
2. **Revoke/delete** the old API key
3. **Generate** a new API key
4. **Update** your local `backend/.env`
5. **Never commit** the new keys

---

## 📋 Quick Verification Checklist

Before every push, run:

```bash
# ✅ 1. Check status
git status

# ✅ 2. Check what will be committed
git diff --cached

# ✅ 3. Search for secrets in staged files
git diff --cached | grep -iE 'api_key|secret|password|token'

# ✅ 4. If any matches found, DON'T PUSH!
```

---

## 🛡️ Automated Protection: Pre-commit Hook

**Prevent accidents with a pre-commit hook:**

```bash
# Install Husky
npm install --save-dev husky

# Initialize Husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run check-secrets"
```

**Add to `package.json`:**

```json
{
  "scripts": {
    "check-secrets": "git diff --cached --name-only | grep -qE '\\.env|apikeys|credentials|secret|private' && echo '❌ ERROR: Attempting to commit sensitive files!' && exit 1 || exit 0"
  }
}
```

---

## 🔍 Scan Repository for Leaked Secrets

```bash
# Using gitleaks
brew install gitleaks  # macOS
gitleaks detect --source . --verbose

# Using truffleHog
pip install truffleHog
trufflehog --regex --entropy=True .

# Using detect-secrets
pip install detect-secrets
detect-secrets scan > .secrets.baseline
```

---

## ✅ FINAL SAFETY COMMANDS (Run These Now)

```bash
# 1. Remove sensitive files from tracking
git rm --cached backend/.env
git rm --cached frontend/.env
git rm --cached APIKEYS.md 2>/dev/null

# 2. Verify .env is ignored
echo "backend/.env" >> .gitignore
echo "frontend/.env" >> .gitignore

# 3. Commit .gitignore
git add .gitignore
git commit -m "chore: secure .gitignore - block sensitive files"

# 4. Verify no secrets staged
git diff --cached | grep -iE "sk-|api_key|secret|password" && echo "⚠️ SECRETS DETECTED!" || echo "✅ Safe to push"

# 5. Push if safe
git push origin main
```

---

## 📞 Emergency: Keys Already Pushed?

1. **Immediately revoke all API keys** (see Step 6)
2. **Run history rewrite** (Option A or B above)
3. **Force push** to overwrite GitHub history
4. **Notify team** that history was rewritten
5. **Generate new keys** and update `.env`

---

## 🎯 Summary: Safe Workflow

```bash
# Every time before committing:

1️⃣ git status                    # Check what will be committed
2️⃣ git diff --cached             # Review staged changes
3️⃣ git diff --cached | grep -iE "api_key|secret|password"  # Search for secrets
4️⃣ git add .gitignore            # Only add safe files
5️⃣ git commit -m "your message"  # Commit
6️⃣ git push origin main          # Push

# NEVER run:
❌ git add .                     # Can accidentally stage .env
❌ git add -A                    # Can accidentally stage secrets
❌ git commit -am "message"      # Can accidentally commit everything
```

---

## ✅ You're Protected When:

- ✅ `.gitignore` contains all sensitive patterns
- ✅ `git status` shows no `.env` or key files
- ✅ `git ls-files | grep .env` returns nothing
- ✅ Pre-commit hooks are installed
- ✅ API keys are rotated after any leak

---

**🔒 Stay Safe! Never commit secrets! 🔒**
