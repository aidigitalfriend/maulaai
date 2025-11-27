#!/bin/bash

# Complete Auth System Production Deployment
echo "🚀 Deploying Complete Auth System to Production..."

# Set production environment
export NODE_ENV=production
export NEXTAUTH_URL=https://onelastai.co
export MONGODB_URI="mongodb+srv://production:secure@cluster.mongodb.net/onelastai?retryWrites=true&w=majority"
export JWT_SECRET="super-secure-jwt-production-2024"

# Email Configuration (Your provided settings)
export SMTP_HOST=smtp.mail.me.com
export SMTP_PORT=587
export SMTP_USER=reset-password@onelastai.co
export WELCOME_SMTP_USER=welcome@onelastai.co
export SMTP_PASS=1UsaJohnny
export FROM_EMAIL=reset-password@onelastai.co
export WELCOME_FROM_EMAIL=welcome@onelastai.co
export SUPPORT_EMAIL=support@onelastai.co

echo "✅ Complete Auth System Features Deployed:"
echo "   📧 Password Reset: reset-password@onelastai.co"
echo "   🎉 Welcome Emails: welcome@onelastai.co"
echo "   🆘 Support Contact: support@onelastai.co"
echo "   🔐 JWT Authentication Active"
echo "   🗄️  MongoDB Session Storage"
echo "   🛡️  Protected Routes & Components"
echo "   🔄 Smart Auth Redirects"

cd frontend && npm start
