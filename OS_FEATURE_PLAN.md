# Plano de Implementação - Ferramenta de Gestão de Ordem de Serviço

## Objetivo
Criar uma ferramenta completa de gestão de Ordem de Serviço (OS) com autenticação, formulário para parceiros, painel administrativo e integração de e-mail.

## Estrutura de Dados

### Tabelas do Banco de Dados

#### 1. `service_orders` (Ordens de Serviço)
- `id` (int, PK, auto-increment)
- `osNumber` (varchar, unique) - Número da OS
- `status` (enum: 'draft', 'sent', 'in_progress', 'completed', 'closed') - Status
- `partnerId` (int, FK) - ID do parceiro/consultor
- `clientName` (varchar) - Nome do cliente
- `clientEmail` (varchar) - Email do cliente
- `serviceType` (varchar) - Tipo de serviço prestado
- `startDateTime` (datetime) - Data e hora de início
- `interval` (int) - Intervalo (em minutos ou horas)
- `endDateTime` (datetime) - Data e hora de término
- `totalHours` (decimal) - Total de horas (calculado)
- `description` (text) - Descrição do serviço
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

#### 2. `os_payments` (Pagamentos de OS)
- `id` (int, PK, auto-increment)
- `osId` (int, FK) - ID da OS
- `partnerId` (int, FK) - ID do parceiro
- `amount` (decimal) - Valor do pagamento
- `paymentStatus` (enum: 'pending', 'scheduled', 'completed') - Status do pagamento
- `paymentDate` (date) - Data do pagamento
- `notes` (text) - Observações
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

#### 3. `partners` (Parceiros/Consultores)
- `id` (int, PK, auto-increment)
- `userId` (int, FK) - ID do usuário (relação com tabela users)
- `companyName` (varchar) - Nome da empresa/consultor
- `email` (varchar) - Email
- `phone` (varchar) - Telefone
- `role` (enum: 'partner', 'manager', 'admin') - Papel do usuário
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

## Funcionalidades

### 1. Autenticação e Autorização
- Login com credenciais (parceiros, gestores, admin)
- Roles: `partner` (cria OS), `manager` (gerencia OS), `admin` (acesso total)
- Proteção de rotas via `protectedProcedure`

### 2. Formulário de OS (Parceiros)
- Preenchimento de campos: OS Number, Cliente, Tipo de Serviço, Datas/Horas, Descrição
- Cálculo automático de Total de Horas
- Botões: "Salvar" (banco de dados) e "Enviar" (email + painel)
- Validação de campos obrigatórios

### 3. Painel de Gestão (Gestores/Admin)
- Resumo de OS por consultor
- Filtros: Status, Período, Consultor
- Ações: Visualizar detalhes, Encerrar OS, Adicionar informações de pagamento
- Relatório de pagamentos

### 4. Integração de E-mail
- Envio de OS para email do cliente
- Template profissional com informações da OS
- Notificação para gestor quando OS é enviada

## Fluxo de Dados

```
Parceiro (Formulário) 
  ↓
Salvar → Banco de Dados (status: 'draft')
  ↓
Enviar → Email Cliente + Painel (status: 'sent')
  ↓
Gestor/Admin (Painel de Gestão)
  ↓
Visualizar → Encerrar → Adicionar Pagamento → Fechar
```

## Implementação

### Fase 1: Schema do Banco de Dados
- [ ] Criar tabelas: `service_orders`, `os_payments`, `partners`
- [ ] Executar migrações: `pnpm db:push`

### Fase 2: APIs tRPC
- [ ] `os.create` - Criar nova OS
- [ ] `os.update` - Atualizar OS
- [ ] `os.send` - Enviar OS (email + status)
- [ ] `os.list` - Listar OS (com filtros)
- [ ] `os.getById` - Obter detalhes da OS
- [ ] `os.close` - Encerrar OS
- [ ] `payment.add` - Adicionar informação de pagamento
- [ ] `payment.list` - Listar pagamentos

### Fase 3: Frontend - Formulário de OS
- [ ] Página: `/partners/service-orders/new`
- [ ] Componentes: FormularioOS, CamposData, CalculadoraHoras
- [ ] Integração com tRPC

### Fase 4: Frontend - Painel de Gestão
- [ ] Página: `/admin/service-orders`
- [ ] Componentes: TabelaOS, FiltrosOS, ModalPagamento
- [ ] Integração com tRPC

### Fase 5: Integração de E-mail
- [ ] Configurar serviço de e-mail (Manus Built-in ou externo)
- [ ] Template de OS em HTML
- [ ] Envio automático

### Fase 6: Testes
- [ ] Testes unitários (vitest)
- [ ] Testes de integração
- [ ] Teste end-to-end

## Endpoints tRPC

```typescript
// Públicos (autenticados)
trpc.os.create(data) → { id, osNumber, status }
trpc.os.update(id, data) → { success, os }
trpc.os.send(id) → { success, message }
trpc.os.getById(id) → OS
trpc.os.list(filters) → OS[]

// Admin/Manager
trpc.os.close(id, paymentData) → { success, os }
trpc.payment.add(osId, data) → { success, payment }
trpc.payment.list(filters) → Payment[]
```

## Segurança

- Autenticação obrigatória para todas as rotas
- Autorização por role (partner, manager, admin)
- Validação de entrada com Zod
- Proteção contra CSRF
- Rate limiting em endpoints críticos

## Próximos Passos

1. Implementar schema do banco de dados
2. Criar APIs tRPC
3. Desenvolver interface do usuário
4. Integrar e-mail
5. Testar e refinar
