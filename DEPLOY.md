# Guia de Deploy - Monstter Site

## Hospedagem Atual
- **Plataforma**: Manus Space
- **CNAME**: cname.manus.space
- **IP**: 104.18.26.246
- **Repositório**: https://github.com/murilogois82/monstter-site

## Deploy Automático via GitHub

O site está configurado para deploy automático. Qualquer push para o branch `main` dispara automaticamente o processo de build e deploy na infraestrutura da Manus.

### Último Deploy
- **Commit**: `638c9c6`
- **Data**: 23/01/2026
- **Alterações**: Integração de e-mail, dashboard de pagamentos e gerenciamento de usuários

## Configuração de Variáveis de Ambiente

As seguintes variáveis de ambiente devem ser configuradas no painel da Manus:

### Banco de Dados
```
DATABASE_URL=mysql://user:password@host:port/database
```

### Servidor de E-mail (SMTP)
```
SMTP_HOST=smtps.uhserver.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=atendimento@monstter.com.br
SMTP_PASS=#Monstter@2026
```

### Aplicação
```
NODE_ENV=production
PORT=3000
```

## Checklist Pré-Deploy

Antes de fazer deploy em produção, certifique-se de:

- [ ] Configurar todas as variáveis de ambiente no painel da Manus
- [ ] Testar o envio de e-mails em ambiente de desenvolvimento
- [ ] Realizar backup completo do banco de dados
- [ ] Verificar se as migrações do banco foram executadas (`pnpm db:push`)
- [ ] Testar o carregamento do dashboard com dados reais
- [ ] Capacitar a equipe sobre as novas funcionalidades

## Processo de Build

O sistema executa automaticamente:

1. **Frontend Build**: `vite build`
   - Compila React + TypeScript + Tailwind CSS
   - Gera assets otimizados em `/dist`

2. **Backend Build**: `esbuild server/_core/index.ts`
   - Compila servidor Node.js + Express + tRPC
   - Gera bundle em `/dist/index.js`

3. **Start**: `node dist/index.js`
   - Inicia o servidor em modo produção

## Rollback

Em caso de problemas críticos:

1. Acesse o painel da Manus
2. Selecione um deploy anterior estável
3. Clique em "Rollback" ou "Redeploy"

Alternativamente, via Git:
```bash
git revert HEAD
git push origin main
```

## Monitoramento

Após o deploy, monitore:

- **Logs de erro**: Verifique o painel da Manus
- **Envio de e-mails**: Teste criando uma OS
- **Dashboard**: Acesse e verifique carregamento dos gráficos
- **Gerenciamento de usuários**: Teste criar/editar usuários

## Suporte

Para problemas de deploy ou infraestrutura, contate o suporte da Manus em https://help.manus.im
