# Guia de Publicação na KingHost - Monstter

Este documento descreve os passos necessários para publicar o site Monstter no servidor da KingHost.

## Pré-requisitos
- Acesso FTP/SFTP ao servidor.
- Banco de Dados MySQL criado no painel da KingHost.
- Node.js instalado e habilitado (se for usar o servidor Node.js).
- Gerenciador de processos (PM2) instalado no servidor.

## Estrutura de Arquivos para Upload
Você deve enviar o conteúdo do diretório `dist/` e as pastas necessárias para o funcionamento do servidor.

### Arquivos Principais:
- `dist/index.js` (O servidor compilado)
- `dist/public/` (Os arquivos estáticos do frontend - CSS, JS, Imagens)
- `package.json` (Para instalação de dependências no servidor)
- `pnpm-lock.yaml` (Para garantir versões corretas)
- `.env` (Arquivo de configuração - deve ser criado no servidor)

## Configuração do Banco de Dados
1. Acesse o painel da KingHost e crie um banco de dados MySQL.
2. No seu terminal local, execute as migrações (ajustando a `DATABASE_URL` para o banco da KingHost):
   ```bash
   DATABASE_URL=mysql://usuario:senha@host_kinghost:3306/nome_banco pnpm db:push
   ```

## Configuração do Ambiente (.env)
Crie um arquivo `.env` na raiz do projeto no servidor com as seguintes variáveis:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://usuario:senha@host_kinghost:3306/nome_banco
JWT_SECRET=sua_chave_secreta_aqui
SMTP_HOST=smtps.uhserver.com
SMTP_PORT=465
SMTP_USER=atendimento@monstter.com.br
SMTP_PASS=sua_senha_smtp_aqui
APP_URL=https://monstter.com.br
```

## Passo a Passo da Publicação

### Opção 1: Servidor Node.js (Recomendado para APIs tRPC)
1. Faça o upload dos arquivos citados acima via FTP.
2. Acesse o servidor via SSH.
3. Instale as dependências:
   ```bash
   pnpm install --prod
   ```
4. Inicie o servidor usando PM2:
   ```bash
   pm2 start ecosystem.config.cjs
   ```

### Opção 2: Somente Frontend Estático (Se a API for hospedada separadamente)
1. Faça o upload de todo o conteúdo da pasta `docs/` para a pasta pública do seu servidor (geralmente `www/` ou `public_html/`).
2. O arquivo `.htaccess` e `index.php` já estão configurados para lidar com o roteamento do React.

## Notas sobre o Roteamento
Para que as rotas do React (como `/servicos`, `/contato`, etc.) funcionem corretamente no servidor Apache/PHP da KingHost, incluímos:
- `.htaccess`: Redireciona todas as requisições para o `index.php`.
- `index.php`: Serve o `index.html` permitindo que o React assuma o roteamento.

## Suporte
Em caso de dúvidas sobre a configuração do Node.js na KingHost, consulte a [documentação oficial da KingHost](https://king.host/wiki/).
