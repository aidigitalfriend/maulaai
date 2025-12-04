# 🚀 Deploy Security Page Now

## Quick Deploy Commands

### Connect to server and run these commands:

```bash
ssh ubuntu@47.129.43.231
```

Then run:

```bash
cd /var/www/shiny-friend-disco
git pull origin main
pm2 restart onelastai-backend
cd frontend
npm run build
pm2 restart onelastai-frontend
pm2 logs
```

## Or use one-liner:

```bash
ssh ubuntu@47.129.43.231 "cd /var/www/shiny-friend-disco && git pull origin main && pm2 restart onelastai-backend && cd frontend && npm run build && pm2 restart onelastai-frontend && pm2 list"
```

## Test after deployment:

Visit: **https://onelastai.co/dashboard/security**

Test with:

- Email: `test@onelastai.co`
- Password: `test123`

## Features to test:

1. ✅ Change Password
2. ✅ Toggle 2FA (should show QR code)
3. ✅ View Backup Codes
4. ✅ Trusted Devices list
5. ✅ Login History table
6. ✅ Remove Device button
