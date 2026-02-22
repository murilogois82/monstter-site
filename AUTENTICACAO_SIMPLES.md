# Sistema de Autenticação Simples

Este documento descreve o novo sistema de autenticação baseado em usuário/senha, armazenado na tabela de usuários do banco de dados.

## Visão Geral

O sistema foi implementado para permitir autenticação local sem depender de OAuth. Todos os usuários agora podem fazer login com um nome de usuário e senha.

## Credenciais Padrão

**Usuário Admin Padrão:**
- Usuário: `admin`
- Senha: `admin`
- Função: `admin` (acesso total)

## Arquitetura

### Banco de Dados

A tabela `users` foi estendida com dois novos campos:

- `username` (VARCHAR 255, UNIQUE): Nome de usuário único para login
- `passwordHash` (VARCHAR 255): Hash bcrypt da senha (nunca armazenar senha em texto plano)

### Funções de Autenticação (server/db.ts)

```typescript
// Hash uma senha
export async function hashPassword(password: string): Promise<string>

// Comparar senha com hash
export async function comparePassword(password: string, hash: string): Promise<boolean>

// Login com usuário/senha
export async function loginUser(username: string, password: string)

// Criar novo usuário com senha
export async function createUserWithPassword(
  username: string,
  password: string,
  name?: string,
  email?: string,
  role?: "user" | "admin" | "manager" | "partner"
)

// Atualizar senha do usuário
export async function updateUserPassword(userId: number, newPassword: string)

// Obter usuário por username
export async function getUserByUsername(username: string)
```

### APIs de Autenticação (server/routers.ts)

#### `auth.loginLocal` (POST /api/trpc/auth.loginLocal)

Realiza login com usuário e senha.

**Input:**
```json
{
  "username": "admin",
  "password": "admin"
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
    "role": "admin",
    "createdAt": "2026-02-22T00:00:00Z",
    "updatedAt": "2026-02-22T00:00:00Z",
    "lastSignedIn": "2026-02-22T00:00:00Z"
  }
}
```

**Erros:**
- "Usuario ou senha invalidos" - Credenciais incorretas

#### `auth.registerLocal` (POST /api/trpc/auth.registerLocal)

Cria um novo usuário com username/senha.

**Input:**
```json
{
  "username": "newuser",
  "password": "password123",
  "name": "New User",
  "email": "newuser@example.com"
}
```

**Output:**
```json
{
  "success": true,
  "user": {
    "id": 2,
    "username": "newuser",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "user",
    "createdAt": "2026-02-22T00:00:00Z",
    "updatedAt": "2026-02-22T00:00:00Z",
    "lastSignedIn": "2026-02-22T00:00:00Z"
  }
}
```

**Erros:**
- "Username ja existe" - Username já está em uso
- "Falha ao criar usuario" - Erro ao criar usuário

### Página de Login (client/src/pages/SimpleLogin.tsx)

Interface de login simples com:
- Campo de usuário
- Campo de senha
- Botão de login
- Mensagens de erro
- Indicador de carregamento
- Credenciais de teste exibidas

## Fluxo de Autenticação

1. Usuário acessa `/login` (página SimpleLogin.tsx)
2. Insere username e senha
3. Clica em "Entrar"
4. Frontend chama `auth.loginLocal` via tRPC
5. Backend valida credenciais no banco de dados
6. Se válido:
   - Cria cookie de sessão
   - Retorna dados do usuário
   - Frontend redireciona para `/admin`
7. Se inválido:
   - Retorna erro "Usuario ou senha invalidos"

## Segurança

### Hash de Senha

- Todas as senhas são hasheadas usando **bcrypt** com 10 salt rounds
- Senhas nunca são armazenadas em texto plano
- Comparação é feita usando `bcrypt.compare()` para evitar timing attacks

### Sessão

- Sessão é armazenada em cookie HTTP-only
- Cookie é assinado para evitar tampering
- Cookie expira após período configurado

### Validação

- Username deve ter pelo menos 3 caracteres
- Senha deve ter pelo menos 6 caracteres
- Email é validado quando fornecido

## Gerenciamento de Usuários

### Criar Novo Usuário

```typescript
const user = await createUserWithPassword(
  "newuser",
  "password123",
  "New User",
  "newuser@example.com",
  "user"
);
```

### Atualizar Senha

```typescript
await updateUserPassword(userId, "newPassword123");
```

### Obter Usuário

```typescript
const user = await getUserByUsername("admin");
```

## Testes

Execute os testes de autenticação:

```bash
pnpm test simpleAuth
```

Os testes cobrem:
- Hash de senha
- Comparação de senha
- Login com credenciais válidas
- Rejeição de credenciais inválidas
- Criação de novo usuário

## Migração do OAuth

O sistema mantém compatibilidade com OAuth (campo `openId` ainda existe). Usuários podem:
- Fazer login com username/senha (novo)
- Fazer login com OAuth (antigo)

Para migrar completamente para autenticação local:
1. Remover dependências de OAuth
2. Remover rota de callback de OAuth
3. Remover variáveis de ambiente de OAuth

## Próximos Passos

1. **Recuperação de Senha**: Implementar fluxo de reset de senha por email
2. **Autenticação de Dois Fatores**: Adicionar 2FA para segurança adicional
3. **Auditoria de Login**: Registrar tentativas de login (sucesso/falha)
4. **Bloqueio de Conta**: Bloquear conta após múltiplas tentativas falhadas
5. **Política de Senha**: Forçar alteração de senha periódica

## Troubleshooting

### Erro: "Usuario ou senha invalidos"

- Verifique se o username está correto
- Verifique se a senha está correta
- Verifique se o usuário existe no banco de dados

### Erro: "Username ja existe"

- O username já está em uso
- Use um username diferente

### Erro: "Falha ao criar usuario"

- Verifique se o banco de dados está acessível
- Verifique se os campos obrigatórios foram preenchidos
- Verifique os logs do servidor

## Suporte

Para mais informações sobre autenticação, consulte:
- `server/db.ts` - Funções de autenticação
- `server/routers.ts` - APIs de autenticação
- `client/src/pages/SimpleLogin.tsx` - Interface de login
- `server/simpleAuth.test.ts` - Testes de autenticação
