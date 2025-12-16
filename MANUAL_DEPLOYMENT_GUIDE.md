# Manual Deployment Guide (Without SSH)

## Current Situation

- SSH is asking for password (should use key authentication)
- EC2 Instance Connect failed
- Session Manager not available (SSM agent not installed)
- Website is operational but need to deploy commit 3d4e257

## Option 1: Install SSM Agent (Recommended)

### Using EC2 Serial Console (if enabled):

1. Go to AWS Console → EC2 → Instances
2. Select instance `i-0ccd4c7107169c39f`
3. Actions → Monitor and troubleshoot → EC2 Serial Console
4. Login with ubuntu user
5. Run these commands:

```bash
# Install SSM Agent
sudo snap install amazon-ssm-agent --classic
sudo snap start amazon-ssm-agent

# Verify it's running
sudo snap services amazon-ssm-agent

# Fix SSH authorized_keys (restore key access)
cd ~/.ssh
# Backup current authorized_keys
cp authorized_keys authorized_keys.backup.$(date +%Y%m%d)

# Your SSH public key should be in authorized_keys
# If missing, you'll need to add it from the EC2 key pair
```

## Option 2: Deploy via GitHub Actions (Automated)

Since your code is on GitHub, we can set up GitHub Actions to deploy automatically:

### Setup GitHub Secrets:

1. Go to: https://github.com/aidigitalfriend/shiny-friend-disco/settings/secrets/actions
2. Add these secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`: ap-southeast-1
   - `EC2_INSTANCE_ID`: i-0ccd4c7107169c39f

Then the workflow will use AWS Systems Manager to run commands without SSH.

## Option 3: User Data Script on Next Reboot

1. Stop the instance (don't terminate)
2. Go to Actions → Instance Settings → Edit user data
3. Add this script:

```bash
#!/bin/bash
cd /home/ubuntu/shiny-friend-disco

# Pull latest code
sudo -u ubuntu git pull origin main

# Install and build frontend
cd frontend
sudo -u ubuntu npm ci
sudo -u ubuntu npm run build

# Install backend deps
cd ../backend
sudo -u ubuntu npm ci

# Restart PM2 services
cd /home/ubuntu/shiny-friend-disco
sudo -u ubuntu pm2 restart all

# Fix SSH key permissions (restore access)
chmod 700 /home/ubuntu/.ssh
chmod 600 /home/ubuntu/.ssh/authorized_keys
```

4. Start the instance
5. Wait 2-3 minutes for deployment to complete

## Option 4: Create New AMI & Launch New Instance

If the instance might be compromised:

1. Create AMI from current instance (backup)
2. Launch new instance with proper SSH key
3. Update DNS to point to new instance
4. Terminate old instance after verification

## Current Commit to Deploy

**Commit**: 3d4e257
**Changes**: Agent Management page - removed upgrade/downgrade, added "Chat with Agent" button
**Files**: frontend/app/dashboard/agent-management/page.tsx

## Verification After Deployment

```bash
curl https://onelastai.co/dashboard/agent-management
# Should show updated page with "Chat with Agent" button
```

## Security Note

SSH suddenly asking for password indicates:

- authorized_keys file was modified/deleted
- SSH configuration changed
- Possible security breach

**Recommend**:

1. Review CloudWatch logs for unusual activity
2. Check /var/log/auth.log for unauthorized access attempts
3. Consider rotating all credentials
4. Install fail2ban and enable AWS GuardDuty
