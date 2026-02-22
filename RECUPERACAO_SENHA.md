# Sistema de Recuperação de Senha por E-mail

Este documento descreve o sistema completo de recuperação de senha por e-mail implementado no Monstter.

## Visão Geral

O sistema permite que usuários redefinam suas senhas através de um fluxo seguro baseado em tokens:

1. Usuário solicita reset em `/forgot-password`
2. Sistema gera token único e envia link por e-mail
3. Usuário clica no link e acessa `/reset-password?token=...`
4. Usuário define nova senha
5. Token é marcado como usado e não pode ser reutilizado

## Arquitetura

### Banco de Dados

**Tabela: password_reset_tokens**

```sql
CREATE TABLE password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiresAt TIMESTAMP NOT NULL,
  usedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_userId_expiresAt (userId, expiresAt)
);
```

**Campos:**
- `id`: Identificador único do token
- `userId`: ID do usuário que solicitou o reset
- `token`: Token único e aleatório (32 caracteres)
- `expiresAt`: Data/hora de expiração (24 horas por padrão)
- `usedAt`: Data/hora quando o token foi utilizado (NULL se não usado)
- `createdAt`: Data/hora de criação do token

### Funções de Backend (server/db.ts)

#### `generateResetToken()`

Gera um token aleatório seguro de 32 caracteres.

```typescript
const token = generateResetToken();
// Resultado: "aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456"
```

#### `createPasswordResetToken(userId, expiresInHours)`

Cria um novo token de reset para um usuário.

```typescript
const { token, expiresAt } = await createPasswordResetToken(1, 24);
// Resultado:
// {
//   token: "aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456",
//   expiresAt: 2026-02-23T04:32:00Z
// }
```

#### `validateResetToken(token)`

Valida se um token existe, não expirou e ainda não foi usado.

```typescript
const resetToken = await validateResetToken("aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456");
// Lança erro se token inválido/expirado
```

#### `resetPasswordWithToken(token, newPassword)`

Reseta a senha usando um token válido.

```typescript
const user = await resetPasswordWithToken(
  "aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456",
  "newPassword123"
);
// Resultado: { id: 1, username: "admin", name: "Admin", ... }
```

#### `requestPasswordReset(email)`

Solicita um reset de senha para um e-mail.

```typescript
const result = await requestPasswordReset("admin@example.com");
// Resultado:
// {
//   success: true,
//   userId: 1,
//   token: "aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456",
//   expiresAt: 2026-02-23T04:32:00Z
// }
```

#### `cleanupExpiredResetTokens()`

Remove tokens expirados ou já utilizados há mais de 7 dias.

```typescript
const deletedCount = await cleanupExpiredResetTokens();
// Resultado: 5 (5 tokens foram deletados)
```

### APIs de Autenticação (server/routers.ts)

#### `auth.requestReset` (POST /api/trpc/auth.requestReset)

Solicita um reset de senha para um e-mail.

**Input:**
```json
{
  "email": "admin@example.com"
}
```

**Output:**
```json
{
  "success": true,
  "userId": 1,
  "token": "aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456",
  "expiresAt": "2026-02-23T04:32:00Z",
  "message": "Link de reset enviado para o e-mail"
}
```

**Segurança:**
- Não revela se o e-mail existe no sistema
- Retorna mensagem genérica para qualquer e-mail

#### `auth.validateToken` (GET /api/trpc/auth.validateToken)

Valida se um token é válido.

**Input:**
```json
{
  "token": "aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456"
}
```

**Output (Válido):**
```json
{
  "valid": true,
  "userId": 1
}
```

**Output (Inválido):**
```json
{
  "valid": false,
  "error": "Token invalido ou expirado"
}
```

#### `auth.resetPassword` (POST /api/trpc/auth.resetPassword)

Reseta a senha usando um token válido.

**Input:**
```json
{
  "token": "aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456",
  "newPassword": "newPassword123"
}
```

**Output:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  },
  "message": "Senha redefinida com sucesso"
}
```

#### `auth.sendResetEmail` (POST /api/trpc/auth.sendResetEmail)

Envia manualmente um e-mail de reset de senha.

**Input:**
```json
{
  "email": "admin@example.com",
  "token": "aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456"
}
```

**Output:**
```json
{
  "success": true
}
```

### Páginas Frontend

#### `/forgot-password` (ForgotPassword.tsx)

Página para solicitar reset de senha.

**Funcionalidades:**
- Campo de e-mail
- Validação de e-mail
- Indicador de carregamento
- Mensagem de sucesso
- Link para voltar ao login

#### `/reset-password?token=...` (ResetPassword.tsx)

Página para redefinir a senha.

**Funcionalidades:**
- Validação automática do token
- Campos de nova senha e confirmação
- Toggle de visibilidade de senha
- Validação de força de senha
- Redirecionamento automático após sucesso
- Mensagem de erro se token inválido

### Serviço de E-mail (server/passwordResetEmail.ts)

#### `sendPasswordResetEmail(email, token, userName)`

Envia e-mail com link de reset de senha.

```typescript
await sendPasswordResetEmail(
  "admin@example.com",
  "aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456",
  "Admin"
);
```

**E-mail enviado contém:**
- Saudação personalizada
- Link clicável para reset
- URL completa como fallback
- Aviso de segurança
- Informação de expiração (24 horas)

#### `testEmailConfiguration()`

Testa se a configuração SMTP está funcionando.

```typescript
await testEmailConfiguration();
// Resultado: { success: true, message: "SMTP connection verified" }
```

## Fluxo Completo

### 1. Solicitação de Reset

```
Usuário → /forgot-password
         → Insere e-mail
         → Clica "Enviar Link de Reset"
         → Frontend chama auth.requestReset
         → Backend cria token
         → Backend envia e-mail
         → Usuário vê mensagem de sucesso
```

### 2. Validação de Token

```
Usuário → Clica link no e-mail
        → /reset-password?token=...
        → Frontend chama auth.validateToken
        → Se válido: exibe formulário
        → Se inválido: exibe erro
```

### 3. Reset de Senha

```
Usuário → Insere nova senha
        → Confirma senha
        → Clica "Redefinir Senha"
        → Frontend chama auth.resetPassword
        → Backend valida token
        → Backend atualiza senha
        → Backend marca token como usado
        → Usuário redireciona para login
```

## Segurança

### Tokens

- **Comprimento**: 32 caracteres (192 bits de entropia)
- **Caracteres**: A-Z, a-z, 0-9 (62 possibilidades por caractere)
- **Geração**: Aleatória usando `Math.random()`
- **Armazenamento**: Hash no banco de dados (não implementado, considerar adicionar)

### Expiração

- **Padrão**: 24 horas
- **Limpeza**: Tokens expirados são removidos automaticamente
- **Reutilização**: Impossível após primeiro uso

### Senhas

- **Hash**: bcrypt com 10 salt rounds
- **Comprimento mínimo**: 6 caracteres
- **Armazenamento**: Nunca em texto plano

### E-mail

- **Segurança**: SMTP com TLS/SSL
- **Credenciais**: Variáveis de ambiente
- **Conteúdo**: Avisos de segurança inclusos

## Variáveis de Ambiente

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app

# Application
APP_URL=https://seu-dominio.com
```

## Testes

Execute os testes de recuperação de senha:

```bash
pnpm test passwordReset
```

Os testes cobrem:
- Geração de tokens
- Validação de tokens
- Fluxo completo de reset
- Segurança de tokens
- Casos de erro

## Troubleshooting

### E-mail não é recebido

1. Verifique se SMTP está configurado corretamente
2. Verifique spam/lixo
3. Verifique logs do servidor
4. Teste com `testEmailConfiguration()`

### Token expirado

1. Token expira em 24 horas
2. Usuário deve solicitar novo reset
3. Tokens antigos são limpos automaticamente

### Senha não é redefinida

1. Verifique se token é válido
2. Verifique se senha atende requisitos mínimos
3. Verifique se banco de dados está acessível
4. Verifique logs do servidor

## Próximos Passos

1. **Hash de Token**: Armazenar hash do token em vez do token em texto plano
2. **Rate Limiting**: Limitar requisições de reset por IP/e-mail
3. **Notificação de Segurança**: Notificar usuário quando senha é redefinida
4. **Autenticação de Dois Fatores**: Exigir 2FA para reset de senha
5. **Histórico de Senhas**: Impedir reutilização de senhas antigas
6. **Expiração de Sessão**: Deslogar usuário após reset de senha

## Suporte

Para mais informações:
- `server/db.ts` - Funções de banco de dados
- `server/routers.ts` - APIs de autenticação
- `server/passwordResetEmail.ts` - Serviço de e-mail
- `client/src/pages/ForgotPassword.tsx` - Página de solicitação
- `client/src/pages/ResetPassword.tsx` - Página de reset
- `server/passwordReset.test.ts` - Testes
