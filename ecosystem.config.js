module.exports = {
  apps: [
    {
      name: 'janox',
      script: './build/app.js',
      watch: false, // Evita reinicios innecesarios
      autorestart: true, // Reinicia en caso de fallo
    },
  ],
};
