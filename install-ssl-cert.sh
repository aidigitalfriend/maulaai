#!/bin/bash
# Cloudflare Origin Certificate Installation Script
# Run this after you have the certificate and private key

echo "=========================================="
echo "Cloudflare Origin Certificate Installer"
echo "=========================================="
echo ""

# Create SSL directory
echo "Creating SSL directory..."
sudo mkdir -p /etc/nginx/ssl
sudo chmod 755 /etc/nginx/ssl

# Create certificate file
echo ""
echo "Creating certificate file..."
echo "Paste your Origin Certificate (including -----BEGIN CERTIFICATE----- and -----END CERTIFICATE-----)"
echo "Then press Ctrl+D when done:"
sudo tee /etc/nginx/ssl/onelastai.co.crt > /dev/null

# Create private key file
echo ""
echo "Creating private key file..."
echo "Paste your Private Key (including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)"
echo "Then press Ctrl+D when done:"
sudo tee /etc/nginx/ssl/onelastai.co.key > /dev/null

# Set secure permissions
echo ""
echo "Setting secure permissions..."
sudo chmod 600 /etc/nginx/ssl/onelastai.co.crt
sudo chmod 600 /etc/nginx/ssl/onelastai.co.key
sudo chown root:root /etc/nginx/ssl/*

# Verify files
echo ""
echo "Verifying certificate files..."
if [ -f /etc/nginx/ssl/onelastai.co.crt ] && [ -f /etc/nginx/ssl/onelastai.co.key ]; then
    echo "✅ Certificate files created successfully"
    echo "Certificate: /etc/nginx/ssl/onelastai.co.crt"
    echo "Private Key: /etc/nginx/ssl/onelastai.co.key"
    
    # Check certificate
    echo ""
    echo "Certificate details:"
    sudo openssl x509 -in /etc/nginx/ssl/onelastai.co.crt -noout -subject -dates
else
    echo "❌ Error: Certificate files not found"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Certificate installation complete!"
echo "=========================================="
