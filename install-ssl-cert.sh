#!/bin/bash
# Cloudflare Origin Certificate Installation & Nginx Config Script
# - Installs/updates Cloudflare Origin Cert and Key under /etc/nginx/ssl
# - Optionally deploys the HTTPS origin Nginx config with SSE carve-outs and WAF-safe paths
# Usage:
#   DOMAIN=onelastai.co ./install-ssl-cert.sh
#   (Run on your EC2/Ubuntu server from the repo root so nginx/*.conf is available)

set -euo pipefail

DOMAIN="${DOMAIN:-onelastai.co}"
SSL_DIR="/etc/nginx/ssl"
CERT_PATH="$SSL_DIR/$DOMAIN.crt"
KEY_PATH="$SSL_DIR/$DOMAIN.key"
SITE_AVAILABLE="/etc/nginx/sites-available/$DOMAIN"
SITE_ENABLED="/etc/nginx/sites-enabled/$DOMAIN"
REPO_CONF="$(pwd)/nginx/onelastai.co.cloudflare.conf"

echo "=========================================="
echo "Cloudflare Origin Certificate Installer"
echo "Domain: $DOMAIN"
echo "=========================================="
echo ""

# Create SSL directory
echo "Creating SSL directory at $SSL_DIR ..."
sudo mkdir -p "$SSL_DIR"
sudo chmod 755 "$SSL_DIR"

# Backup existing cert/key if present
ts="$(date +%Y%m%d-%H%M%S)"
if [ -f "$CERT_PATH" ] || [ -f "$KEY_PATH" ]; then
    echo "Existing cert/key detected. Backing up to $SSL_DIR/backup-$ts ..."
    sudo mkdir -p "$SSL_DIR/backup-$ts"
    [ -f "$CERT_PATH" ] && sudo cp -a "$CERT_PATH" "$SSL_DIR/backup-$ts/" || true
    [ -f "$KEY_PATH" ] && sudo cp -a "$KEY_PATH" "$SSL_DIR/backup-$ts/" || true
fi

# Create/Update certificate file
echo ""
echo "Creating certificate file at $CERT_PATH ..."
echo "Paste your Cloudflare Origin Certificate (including -----BEGIN CERTIFICATE----- and -----END CERTIFICATE-----)"
echo "Then press Ctrl+D when done:"
sudo tee "$CERT_PATH" > /dev/null

# Create/Update private key file
echo ""
echo "Creating private key file at $KEY_PATH ..."
echo "Paste your Private Key (including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)"
echo "Then press Ctrl+D when done:"
sudo tee "$KEY_PATH" > /dev/null

# Set secure permissions
echo ""
echo "Setting secure permissions..."
sudo chmod 600 "$CERT_PATH"
sudo chmod 600 "$KEY_PATH"
sudo chown root:root "$CERT_PATH" "$KEY_PATH"

# Verify files
echo ""
echo "Verifying certificate files..."
if [ -f "$CERT_PATH" ] && [ -f "$KEY_PATH" ]; then
        echo "✅ Certificate files created successfully"
        echo "Certificate: $CERT_PATH"
        echo "Private Key: $KEY_PATH"
    
        # Check certificate
        echo ""
        echo "Certificate details:"
        sudo openssl x509 -in "$CERT_PATH" -noout -subject -dates || true
else
        echo "❌ Error: Certificate files not found"
        exit 1
fi

# Prompt to deploy HTTPS origin Nginx config
echo ""
read -r -p "Apply HTTPS origin Nginx config now (Cloudflare Full/Strict)? [Y/n] " RESP
RESP=${RESP:-Y}
if [[ "$RESP" =~ ^[Yy]$ ]]; then
    if [ ! -f "$REPO_CONF" ]; then
        echo "❌ Nginx config template not found at $REPO_CONF"
        echo "Make sure you run this script from the repo root containing nginx/onelastai.co.cloudflare.conf"
        exit 1
    fi

    echo "Deploying Nginx site config to $SITE_AVAILABLE ..."
    # Backup existing site if present
    if [ -f "$SITE_AVAILABLE" ]; then
        sudo cp -a "$SITE_AVAILABLE" "$SITE_AVAILABLE.backup-$ts"
        echo "Backup saved at $SITE_AVAILABLE.backup-$ts"
    fi

    # Copy and adjust domain placeholders if needed (this file already targets onelastai.co)
    sudo cp "$REPO_CONF" "$SITE_AVAILABLE"

    # Ensure symlink in sites-enabled
    if [ ! -L "$SITE_ENABLED" ]; then
        sudo ln -sfn "$SITE_AVAILABLE" "$SITE_ENABLED"
    fi

    echo "Testing Nginx configuration..."
    sudo nginx -t

    echo "Reloading Nginx..."
    sudo systemctl reload nginx

    echo ""
    echo "=========================================="
    echo "✅ HTTPS origin enabled and Nginx reloaded"
    echo "=========================================="
    echo "Quick checks (run these locally on the server):"
    echo "  - curl -I https://$DOMAIN"
    echo "  - curl -I https://$DOMAIN/api/x-community/posts"
    echo "  - curl -s -D - https://$DOMAIN/api/x-community/stream -o /dev/null"
else
    echo "Skipping Nginx config deployment per user choice."
fi

echo ""
echo "=========================================="
echo "✅ Certificate installation complete!"
echo "=========================================="
