module.exports = {
  apps: [
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
    },
    {
      name: 'shiny-backend',
      cwd: '/home/ubuntu/shiny-friend-disco/backend',
      script: 'server-simple-auth-current.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    }
  ]
};
