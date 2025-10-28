/**
 * PM2 Ecosystem Configuration
 * Manages frontend and backend processes for production
 */

module.exports = {
  apps: [
    // Frontend Next.js Application
    {
      name: 'shiny-frontend',
      cwd: '/var/www/shiny-friend-disco/frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/frontend-error.log',
      out_file: '/var/log/pm2/frontend-out.log',
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
      cwd: '/var/www/shiny-friend-disco/backend',
      script: 'server-simple.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
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
