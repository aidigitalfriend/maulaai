# Live Development & Instant Change Visibility

This guide enables you to see frontend + backend changes immediately without a full production rebuild.

## 1. New Dev Scripts
Root `package.json` now includes:
- `npm run dev` → Runs frontend on port 3100 (hot reload) + backend with watcher (nodemon)
- Frontend dev only: `npm run dev:frontend:3100`
- Backend dev only: `npm run dev:backend:watch`

Frontend `package.json`:
- `npm run dev:3100` → Next.js dev server on port 3100

Backend `package.json`:
- `npm run dev:watch` → Auto-restarts on JS/TS changes

## 2. Local Development (Recommended)
```bash
# Install all deps once
npm run install:all
# Start both services locally
npm run dev
# Frontend at http://localhost:3100
# Backend API (if server-simple.js exposes port 3005) at http://localhost:3005
```
Adjust `NEXT_PUBLIC_API_URL` in your env if needed.

## 3. Remote Development (Server) via SSH Tunnel
If production occupies port 3000, run dev stack on server and tunnel:
```bash
# On server (EC2)
cd /home/ubuntu/shiny-friend-disco
npm run dev
# Frontend now listening on 3100 (hot reload)

# On your local machine (macOS)
ssh -i /path/to/key.pem -L 3100:localhost:3100 ubuntu@ec2-47-129-43-231.ap-southeast-1.compute.amazonaws.com
# Then visit http://localhost:3100 locally (served from remote)
```
Backend dev (if needed):
```bash
ssh -i /path/to/key.pem -L 3005:localhost:3005 ubuntu@ec2-47-129-43-231.ap-southeast-1.compute.amazonaws.com
# Access http://localhost:3005 for backend APIs
```

## 4. Optional: PM2 Dev Process (Non-Prod)
To keep a persistent dev session without replacing production:
```bash
# Start frontend dev
pm2 start --name shiny-frontend-dev --env development -- "npm run dev:frontend:3100"
# Start backend watch
pm2 start --name shiny-backend-dev -- "npm run dev:backend:watch"

# Stop when done
pm2 stop shiny-frontend-dev shiny-backend-dev
pm2 delete shiny-frontend-dev shiny-backend-dev
```
Make sure nginx does NOT proxy dev ports publicly unless you configure a dev subdomain.

## 5. Viewing Changes
- Save a file in `frontend/` → Browser auto reloads (Fast Refresh)
- Save a file in `backend/` → Nodemon restarts server-simple.js
- No manual `npm run build` or PM2 production restart required for iterative edits.

## 6. Image Config Modernization
`frontend/next.config.js` now uses `remotePatterns` (recommended) for `onelastai.co` assets. This removes deprecation warnings.

## 7. Common Issues & Fixes
| Issue | Cause | Fix |
|-------|-------|-----|
| Production still served | Hitting live domain | Use SSH tunnel & dev port 3100 |
| 3100 not accessible publicly | Cloudflare/Nginx restrict ports | Rely on SSH tunnel or add nginx dev mapping |
| API calls fail in dev | Wrong base URL | Set `NEXT_PUBLIC_API_URL=http://localhost:3005` |
| Changes not reloading | Running `next start` instead of `next dev` | Use `npm run dev` |

## 8. Environment Variables
Create `.env.local` in `frontend/`:
```
NEXT_PUBLIC_API_URL=http://localhost:3005
```
Backend `.env` for remote dev should mirror production secrets but NEVER commit them.

## 9. Reverting to Production
Stop dev processes and rely on PM2 production apps:
```bash
pm2 list
pm2 restart shiny-frontend shiny-backend
```

## 10. Quick Commands Summary
```bash
# Install all deps
npm run install:all
# Start live dev (both)
npm run dev
# Frontend only
npm run dev:frontend:3100
# Backend only
npm run dev:backend:watch
```

---
This setup gives instant feedback while keeping production untouched.
