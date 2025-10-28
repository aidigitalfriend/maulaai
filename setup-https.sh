#!/bin/bash
# Complete HTTPS Setup for onelastai.co
# This script will install the Cloudflare Origin Certificate and configure Nginx

set -e  # Exit on any error

echo "=========================================="
echo "🔒 HTTPS Setup for onelastai.co"
echo "=========================================="
echo ""

# Step 1: Create SSL directory
echo "📁 Step 1: Creating SSL directory..."
sudo mkdir -p /etc/nginx/ssl
sudo chmod 755 /etc/nginx/ssl
echo "✅ SSL directory created"
echo ""

# Step 2: Install certificate
echo "📜 Step 2: Installing Origin Certificate..."
echo ""
echo "IMPORTANT: Have your Cloudflare Origin Certificate ready!"
echo ""
echo "Paste the FULL Origin Certificate (including the BEGIN and END lines)"
echo "Then press Ctrl+D on a new line:"
echo ""

# Read certificate
CERT_CONTENT=$(cat)

# Save certificate
echo "$CERT_CONTENT" | sudo tee /etc/nginx/ssl/onelastai.co.crt > /dev/null

if [ ! -s /etc/nginx/ssl/onelastai.co.crt ]; then
    echo "❌ Error: Certificate file is empty!"
    exit 1
fi

echo "✅ Certificate saved"
echo ""

# Step 3: Install private key
echo "🔑 Step 3: Installing Private Key..."
echo ""
echo "Now paste the FULL Private Key (including the BEGIN and END lines)"
echo "Then press Ctrl+D on a new line:"
echo ""

# Read private key
KEY_CONTENT=$(cat)

# Save private key
echo "$KEY_CONTENT" | sudo tee /etc/nginx/ssl/onelastai.co.key > /dev/null

if [ ! -s /etc/nginx/ssl/onelastai.co.key ]; then
    echo "❌ Error: Private key file is empty!"
    exit 1
fi

echo "✅ Private key saved"
echo ""

# Step 4: Set permissions
echo "🔐 Step 4: Setting secure permissions..."
sudo chmod 600 /etc/nginx/ssl/onelastai.co.crt
sudo chmod 600 /etc/nginx/ssl/onelastai.co.key
sudo chown root:root /etc/nginx/ssl/onelastai.co.crt
sudo chown root:root /etc/nginx/ssl/onelastai.co.key
echo "✅ Permissions set"
echo ""

# Step 5: Verify certificate
echo "🔍 Step 5: Verifying certificate..."
if sudo openssl x509 -in /etc/nginx/ssl/onelastai.co.crt -noout -text > /dev/null 2>&1; then
    echo "✅ Certificate is valid"
    echo ""
    echo "Certificate details:"
    sudo openssl x509 -in /etc/nginx/ssl/onelastai.co.crt -noout -subject -issuer -dates
    echo ""
else
    echo "❌ Error: Certificate is invalid!"
    exit 1
fi

# Step 6: Verify private key
echo "🔍 Step 6: Verifying private key..."
if sudo openssl rsa -in /etc/nginx/ssl/onelastai.co.key -check -noout > /dev/null 2>&1; then
    echo "✅ Private key is valid"
    echo ""
else
    echo "❌ Error: Private key is invalid!"
    exit 1
fi

# Step 7: Backup current Nginx config
echo "💾 Step 7: Backing up current Nginx configuration..."
sudo cp /etc/nginx/sites-available/onelastai.co /etc/nginx/sites-available/onelastai.co.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"
echo ""

# Step 8: Download new Nginx config
echo "⬇️  Step 8: Installing new Nginx configuration..."
# The new config will be uploaded separately
echo "⏳ Waiting for new config file..."
echo ""

echo "=========================================="
echo "✅ Certificate Installation Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Upload the new Nginx configuration"
echo "2. Test Nginx configuration"
echo "3. Restart Nginx"
echo "4. Change Cloudflare SSL mode to 'Full (strict)'"
echo ""
