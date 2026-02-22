# Painel de Auditoria - Documentação Completa

## Visão Geral

O painel de auditoria é um sistema completo para registrar, monitorar e analisar todas as alterações de permissões e acessos dos usuários no sistema. Fornece rastreabilidade total de quem fez o quê, quando e com qual resultado.

## Recursos Principais

### 1. **Registro Automático de Eventos**

O sistema registra automaticamente os seguintes eventos:

- **PERMISSION_CHANGE**: Alteração de função/permissão de um usuário
- **LOGIN**: Acesso do usuário ao sistema
- **LOGOUT**: Saída do usuário do sistema
- **ACCESS_DENIED**: Tentativa de acesso negada (sem permissão)
- **CREATE**: Criação de novo usuário ou recurso
- **UPDATE**: Atualização de dados
- **DELETE**: Exclusão de dados

### 2. **Informações Capturadas**

Para cada evento, o sistema registra:

```typescript
{
  id: number;                          // ID único do evento
  userId: number;                      // ID do usuário que realizou a ação
  actionType: string;                  // Tipo de ação realizada
  targetUserId?: number;               // ID do usuário alvo (se aplicável)
  targetUserName?: string;             // Nome do usuário alvo
  actionDetails?: Record<string, any>; // Detalhes adicionais da ação
  oldValues?: Record<string, any>;     // Valores anteriores
  newValues?: Record<string, any>;     // Novos valores
  ipAddress?: string;                  // IP do cliente
  userAgent?: string;                  // User agent do navegador
  status: 'SUCCESS' | 'FAILED' | 'PENDING'; // Status da operação
  errorMessage?: string;               // Mensagem de erro (se houver)
  createdAt: Date;                     // Data/hora do evento
}
```

### 3. **Painel de Visualização**

Acesse o painel em: `/admin/auditoria` (requer permissão de admin)

#### Funcionalidades do Painel:

**Estatísticas Resumidas:**
- Total de eventos registrados
- Operações bem-sucedidas
- Operações falhadas

**Filtros Avançados:**
- 🔍 Busca por nome de usuário
- 📋 Filtro por tipo de ação
- ✓ Filtro por status (Sucesso/Falha)
- 📅 Filtro por período (Hoje/Últimos 7 dias/30 dias/Todos)

**Tabela de Eventos:**
- Data e hora do evento
- Usuário que realizou a ação
- Tipo de ação
- Usuário alvo (se aplicável)
- Status (Sucesso/Falha)
- Detalhes da operação

**Export de Dados:**
- 📥 Exportar relatório em CSV
- Inclui todos os filtros aplicados
- Timestamp no nome do arquivo

## Integração com APIs

### Endpoints de Auditoria

```typescript
// Obter logs com filtros
trpc.audit.getLogs.useQuery({
  userId?: number;
  targetUserId?: number;
  actionType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
})

// Contar eventos
trpc.audit.getCount.useQuery({
  userId?: number;
  targetUserId?: number;
  actionType?: string;
  startDate?: Date;
  endDate?: Date;
})

// Obter logs de um usuário específico
trpc.audit.getByUser.useQuery({
  userId: number;
  limit?: number;
})

// Obter logs por tipo de ação
trpc.audit.getByActionType.useQuery({
  actionType: string;
  limit?: number;
})

// Deletar logs antigos (apenas admin)
trpc.audit.deleteOldLogs.useMutation({
  daysToKeep: number; // Padrão: 90 dias
})
```

## Exemplos de Uso

### Registrar uma Alteração de Permissão

```typescript
import { logAuditEvent } from "./db";

await logAuditEvent({
  userId: 1,                    // Admin que fez a mudança
  actionType: 'PERMISSION_CHANGE',
  targetUserId: 5,              // Usuário que teve permissão alterada
  targetUserName: 'João Silva',
  oldValues: { role: 'user' },
  newValues: { role: 'admin' },
  status: 'SUCCESS',
});
```

### Registrar Acesso Negado

```typescript
await logAuditEvent({
  userId: 3,
  actionType: 'ACCESS_DENIED',
  targetUserId: 2,
  status: 'FAILED',
  errorMessage: 'Acesso negado - usuário não é admin',
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
});
```

### Consultar Logs de um Usuário

```typescript
import { getAuditLogsByUser } from "./db";

const logs = await getAuditLogsByUser(5, 100); // Últimos 100 eventos do usuário 5
```

### Filtrar por Período

```typescript
import { getAuditLogs } from "./db";

const startDate = new Date('2026-02-01');
const endDate = new Date('2026-02-28');

const logs = await getAuditLogs({
  startDate,
  endDate,
  limit: 50,
});
```

## Políticas de Retenção

### Limpeza Automática

O sistema pode ser configurado para deletar logs antigos:

```typescript
import { deleteOldAuditLogs } from "./db";

// Manter apenas os últimos 90 dias
await deleteOldAuditLogs(90);

// Manter apenas os últimos 30 dias
await deleteOldAuditLogs(30);
```

### Recomendações

- **Desenvolvimento**: Manter 30 dias
- **Produção**: Manter 90-180 dias
- **Conformidade**: Manter 1-2 anos conforme regulamentações

## Segurança e Conformidade

### Controle de Acesso

- ✅ Apenas usuários com role **admin** podem acessar o painel
- ✅ Usuários podem visualizar seus próprios logs
- ✅ Logs de acesso negado são registrados para auditoria

### Proteção de Dados

- ✅ Senhas nunca são registradas
- ✅ Tokens de autenticação não são armazenados
- ✅ Dados sensíveis são mascarados quando possível

### Integridade

- ✅ Logs não podem ser editados (apenas deletados)
- ✅ Timestamps são imutáveis
- ✅ Rastreamento de quem fez cada ação

## Casos de Uso

### 1. Auditoria de Alterações de Permissões

Rastreie quem mudou as permissões de qual usuário e quando:

```
Admin (ID: 1) alterou permissão de João Silva (ID: 5)
De: user → Para: admin
Data: 22/02/2026 15:30:00
Status: ✓ Sucesso
```

### 2. Detecção de Acessos Não Autorizados

Identifique tentativas de acesso não autorizado:

```
Usuário (ID: 3) tentou acessar painel administrativo
Status: ✗ Falha
Motivo: Acesso negado - usuário não é admin
Data: 22/02/2026 14:15:00
```

### 3. Rastreamento de Atividades de Usuários

Veja o histórico completo de ações de um usuário:

```
Usuário: Maria Santos (ID: 2)
- Login: 22/02/2026 09:00:00
- Criação de Pedido: 22/02/2026 09:15:00
- Logout: 22/02/2026 17:30:00
```

### 4. Relatórios de Conformidade

Gere relatórios para fins de conformidade regulatória:

```
Período: 01/02/2026 - 28/02/2026
Total de Eventos: 1.250
Operações Bem-sucedidas: 1.200 (96%)
Operações Falhadas: 50 (4%)
```

## Troubleshooting

### Logs não aparecem no painel

1. Verifique se você tem permissão de admin
2. Verifique se a tabela `audit_logs` existe no banco de dados
3. Verifique os logs do servidor para erros de conexão

### Erro ao exportar CSV

1. Verifique se há eventos para exportar
2. Verifique permissões do navegador para downloads
3. Tente novamente em outro navegador

### Performance lenta

1. Reduza o período de filtro
2. Aumente a frequência de limpeza de logs antigos
3. Considere arquivar logs muito antigos

## Próximas Melhorias

- [ ] Gráficos e dashboards de análise
- [ ] Alertas automáticos para ações suspeitas
- [ ] Integração com sistemas de alertas (email, Slack)
- [ ] Arquivamento de logs em longo prazo
- [ ] Análise de tendências e padrões
- [ ] Exportação em múltiplos formatos (PDF, Excel)
- [ ] Assinatura digital de logs para não-repúdio

## Suporte

Para dúvidas ou problemas com o painel de auditoria, entre em contato com o administrador do sistema.
