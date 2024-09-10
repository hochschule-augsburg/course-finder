const os = require('os')

const app = {
  name: 'course-finder-api',
  script: 'dist/main.js',
  max_memory_restart: '300M',

  out_file: './out.log',
  error_file: './error.log',
  merge_logs: true,
  log_date_format: 'YY-MM-DD HH:mm:ss',

  NODE_ENV: 'production',
  TZ: 'Europe/Berlin',
  PORT: 2022,
  exec_mode: 'cluster_mode',
}

module.exports = {
  apps: [
    { ...app, instances: os.cpus().length - 1 },
    { ...app, args: ['master'], instances: 1 },
  ],
}
