/**
 * PM2 Ecosystem Configuration
 * Manages frontend and backend processes for production
 */

module.exports = {
  apps: [
    // Frontend Next.js Application
    {
      name: 'maula-frontend',
      cwd: '/home/ubuntu/maula-ai/frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3100,
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
      shutdown_with_message: true,
    },

    // Backend API Server with Authentication
    {
      name: 'maula-backend',
      cwd: '/home/ubuntu/maula-ai/backend',
      script: 'server-simple.js',
      interpreter: '/usr/bin/node',
      node_args: '-r dotenv/config',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
        DOTENV_CONFIG_PATH: '/home/ubuntu/maula-ai/backend/.env',
        REDIS_URL:
          'redis://default:oSBgRq10A8j5Pg8AMxZmf5P8bOiPYrtn@redis-13535.crce214.us-east-1-3.ec2.cloud.redislabs.com:13535',
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
      shutdown_with_message: true,
    },
  ],
};
