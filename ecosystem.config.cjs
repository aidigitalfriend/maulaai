/**
 * PM2 Ecosystem Configuration
 * Manages frontend and backend processes for production
 */

module.exports = {
  apps: [
    // Frontend Next.js Application
    {
      name: 'shiny-frontend',
      cwd: '/home/ubuntu/shiny-friend-disco/frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
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
      name: 'shiny-backend',
      cwd: '/home/ubuntu/shiny-friend-disco/backend',
      script: 'server-simple.js',
      interpreter: '/usr/bin/node',
      node_args: '-r dotenv/config',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
        REDIS_URL: 'redis://default:O0GuKqY8vfZp4I9QZxG4wwpyhLFxJ2uJ@redis-17779.crce185.ap-seast-1-1.ec2.cloud.redislabs.com:17779',
        DOTENV_CONFIG_PATH: '/home/ubuntu/shiny-friend-disco/backend/.env',
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
