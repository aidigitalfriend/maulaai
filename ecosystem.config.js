/**
 * PM2 Ecosystem Configuration
 * Manages frontend and backend processes for production
 *
 * Notes:
 * - Uses APP_DIR env var when provided, falls back to /home/ubuntu/shiny-friend-disco
 * - Logs go to PM2's default ~/.pm2/logs to avoid permission issues with /var/log
 */

const path = require('path');
const HOME = process.env.HOME || '/home/ubuntu';
const APP_DIR = process.env.APP_DIR || '/home/ubuntu/shiny-friend-disco';
const FRONTEND_CWD = path.join(APP_DIR, 'frontend');
const BACKEND_CWD = path.join(APP_DIR, 'backend');

module.exports = {
  apps: [
    // Frontend Next.js Application
    {
      name: 'shiny-frontend',
  cwd: FRONTEND_CWD,
  // Use a shell wrapper to export variables from root .env before starting Next.js
  script: 'bash',
  args: ['-lc', 'set -a; source /home/ubuntu/shiny-friend-disco/.env; export PORT=3000; exec npm start'],
  // Keep as reference; env vars are sourced via bash wrapper above
  // env_file: '/home/ubuntu/shiny-friend-disco/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true
    },

    // Backend API Server
    {
      name: 'shiny-backend',
      cwd: BACKEND_CWD,
      script: 'server-simple.js',
  // Load backend-specific environment variables
  env_file: '/home/ubuntu/shiny-friend-disco/backend/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true
    }
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'YOUR_EC2_IP_OR_DOMAIN',
      ref: 'origin/main',
      repo: 'git@github.com:aidigitalfriend/shiny-friend-disco.git',
      path: '/var/www/shiny-friend-disco',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js',
      'pre-setup': ''
    }
  }
}
