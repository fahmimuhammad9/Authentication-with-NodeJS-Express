"use strict";

module.exports = {
  apps: [{
    name: 'auth-panel',
    script: './app/index.js',
    autorestart: true,
    watch: false,
    max_memory_restart: "2G",
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};

