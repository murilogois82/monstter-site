module.exports = {
  apps: [
    {
      name: "monstter-site",
      script: "dist/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DATABASE_URL: "mysql://usuario:senha@host:3306/banco",
        JWT_SECRET: "seu_secret_aqui",
        SMTP_HOST: "smtps.uhserver.com",
        SMTP_PORT: 465,
        SMTP_USER: "atendimento@monstter.com.br",
        SMTP_PASS: "sua_senha_smtp",
        APP_URL: "https://monstter.com.br"
      }
    }
  ]
};
