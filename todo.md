
## Fase Final - Ferramenta de OS Completa

- [x] Integração de e-mail SMTP real (smtps.uhserver.com:465)
- [x] Página de listagem de OS para parceiros (/partners/service-orders)
- [x] Dashboard de pagamentos com gráficos
- [x] Configurar rotas e navegação
- [x] Testar e publicar

## Configuração SMTP e Importação de Clientes

- [x] Configurar variáveis de ambiente para SMTP
- [x] Atualizar função de envio de e-mail com credenciais SMTP
- [x] Criar API de importação em massa de clientes (CSV/Excel)
- [x] Criar interface de upload de arquivos
- [x] Validar e processar dados importados
- [x] Testar envio de e-mail e importação

## Correções na Ordem de Serviço

- [x] Descontar intervalo do cálculo de horas totais
- [x] Cliente como seleção do cadastro (dropdown)
- [x] Número de OS automático com código sequencial

## Relatório de Prestação de Serviço

- [x] Atualizar schema com campos de pagamento (tipo fixo/hora, valor cobrado, valor pago)
- [x] Criar tabela de parceiros com vínculo a usuários e clientes
- [x] Criar APIs para cálculo de valores por período
- [x] Criar página de relatório de prestação de serviço
- [x] Implementar export em PDF
- [x] Testar geração de relatório

## Dashboard de Análise Financeira

- [x] Criar APIs para cálculo de métricas financeiras (receita, lucro, horas)
- [x] Criar página de dashboard com gráficos (receita, margem, horas faturáveis)
- [x] Implementar comparativo mensal e filtros por período
- [x] Testar dashboard financeiro

## Campos de Pagamento e Tabela de Parceiros

- [x] Adicionar campos de tipo de pagamento e valor no cadastro de clientes
- [x] Criar tabela de parceiros (consultores) com dados de identificação e pagamento
- [x] Criar APIs para agendamento de relatórios financeiros
- [x] Implementar job de envio automático de relatórios
- [x] Criar interface de configuração de agendamentos
- [x] Testar envio automático de relatórios

## Correções e Melhorias Solicitadas

- [x] Adicionar opção de cadastro de parceiros no painel administrativo
- [x] Corrigir exibição dos campos de pagamento no cadastro de clientes
- [x] Corrigir preenchimento automático de nome e email do cliente ao criar OS
- [x] Testar todas as correções

## Associação de Usuários a Parceiros

- [x] Adicionar campo userId na tabela de parceiros
- [x] Criar migração do banco de dados
- [x] Implementar interface de associação de usuários a parceiros
- [x] Criar API para associar/desassociar usuários a parceiros
- [x] Implementar lógica de acesso ao painel de parceiros
- [x] Criar dashboard de parceiros
- [x] Testar fluxo completo de login e acesso

## Visualização de Calendário no Painel de Parceiros

- [x] Instalar biblioteca de calendário (react-big-calendar ou similar)
- [x] Criar componente de calendário com eventos
- [x] Integrar calendário ao PartnerDashboard
- [x] Adicionar interatividade para visualizar detalhes das ordens
- [x] Testar visualização de calendário

## Correção de Preenchimento de Cliente e E-mail na OS

- [x] Investigar o formulário de criação de OS
- [x] Verificar a API de clientes
- [x] Corrigir preenchimento automático de cliente e e-mail
- [x] Testar salvamento de OS com dados preenchidos

## Correção de Número Automático da OS

- [x] Investigar por que o número automático não está sendo gravado
- [x] Verificar a API getNextOSNumber
- [x] Corrigir o preenchimento do osNumber no formulário
- [x] Testar criação de OS com número automático

## Correção de Visibilidade do Campo de Número da OS

- [x] Investigar por que o campo osNumber está invisível
- [x] Verificar o CSS e renderização
- [x] Corrigir a visibilidade e preenchimento
- [x] Testar gravação do osNumber

## Correção de Campo Editável de Número da OS

- [x] Converter campo de osNumber para Input editável
- [x] Permitir que usuário insira ou edite o número
- [x] Manter sugestão automática como placeholder
- [x] Testar salvamento com número editável

## Correção de Gravação de Campos de Valor

- [x] Investigar campos de valor no cadastro de clientes
- [x] Investigar campos de valor no cadastro de parceiros
- [x] Corrigir APIs de criação/atualização
- [x] Testar gravação de valores

## Correção de Erro ao Salvar Parceiro

- [x] Investigar erro "não encontrado" ao salvar parceiro
- [x] Verificar função createPartner no db.ts
- [x] Corrigir o problema
- [x] Testar salvamento de parceiro

## Painel de Controle para Parceiros

- [x] Criar APIs de estatísticas de ordens de serviço
- [x] Criar APIs de cálculo de receita
- [x] Implementar componentes de cards de estatísticas
- [x] Criar gráficos de desempenho
- [x] Integrar painel ao PartnerDashboard
- [x] Testar painel de controle

## Correção de Gravação de Valor em Parceiros

- [x] Investigar por que o valor não está sendo gravado
- [x] Verificar a API de criação de parceiros
- [x] Verificar a API de atualização de parceiros
- [x] Corrigir o problema
- [x] Testar gravação de valor
- [x] Adicionar campos bancários (cpf, bankName, bankAccount, bankRoutingNumber) às APIs
- [x] Criar testes unitários para validar gravação de campos bancários
- [x] Corrigir erro de import duplicado no PartnerDashboard.tsx

## Correção de Edição de Parceiros

- [x] Investigar por que o campo nome está sendo limpo ao editar
- [x] Corrigir validação obrigatória de todos os campos na edição
- [x] Corrigir gravação do valor (paidValue) na atualização
- [x] Testar edição de parceiro
- [x] Mapear companyName para name no formulário
- [x] Mapear paidValue para paymentValue no formulário
- [x] Adicionar validação de campos obrigatórios na API
- [x] Adicionar valores padrão (null coalescing) para campos opcionais

## Correção de Exibição de Valores de Parceiros

- [x] Investigar por que o valor não aparece na grid de parceiros
- [x] Verificar se o valor está sendo gravado corretamente no banco
- [x] Corrigir a exibição do valor na tabela de parceiros (usar paidValue em vez de paymentValue)
- [x] Investigar cálculo de pagamento ao encerrar OS
- [x] Implementar cálculo de valor do pagamento baseado no tipo (fixo/hora)
- [x] Investigar exibição de pagamentos pendentes no dashboard financeiro
- [x] Criar função getPendingPayments no db.ts
- [x] Adicionar rota listPending na API de pagamentos
- [ ] Testar exibição de valores em todos os locais
- [ ] Integrar pagamentos pendentes no dashboard financeiro

## Correção de Cálculo de Valor no Encerramento da OS

- [x] Investigar como o diálogo de encerramento da OS é aberto
- [x] Implementar cálculo de valor no frontend ao abrir o diálogo
- [x] Buscar dados do parceiro e horas trabalhadas
- [x] Calcular valor baseado no tipo de pagamento (fixo/hora)
- [x] Preencher automaticamente o campo de valor no formulário
- [x] Testar cálculo com diferentes tipos de pagamento
- [x] Adicionar query de parceiros no AdminServiceOrders
- [x] Resetar formulário ao abrir diálogo

## Correção de Cálculo de Pagamentos Pendentes no Dashboard

- [x] Investigar como o dashboard busca pagamentos pendentes
- [x] Verificar se a query payment.listPending está sendo chamada
- [x] Corrigir cálculo do total de pagamentos pendentes
- [x] Corrigir contagem de ordens pendentes
- [x] Testar exibição de pagamentos pendentes no dashboard
- [x] Adicionar query de pagamentos pendentes no PaymentsDashboard
- [x] Usar dados reais da tabela os_payments em vez de cálculo baseado em horas
- [x] Atualizar loading state para incluir pendingPaymentsLoading

## Novas Funcionalidades de Pagamentos e Dashboard de Parceiros

### Seletor de Datas no Dashboard Financeiro
- [ ] Adicionar componente de seletor de datas (data inicial e final)
- [ ] Implementar filtro de pagamentos pendentes por período
- [ ] Atualizar query payment.listPending para aceitar parâmetros de data
- [ ] Exibir total de pagamentos no período selecionado
- [ ] Testar filtro com diferentes períodos

### Checkboxes para Pagamentos Vencidos
- [ ] Calcular dias desde a criação do pagamento
- [ ] Identificar pagamentos com mais de 20 dias
- [ ] Adicionar checkboxes para seleção múltipla
- [ ] Implementar ação em lote (marcar como agendado/concluído)
- [ ] Adicionar indicador visual para pagamentos vencidos
- [ ] Testar seleção e ações em lote

### Dashboard de Gestão de OS para Parceiros
- [ ] Criar página PartnerOSManagement.tsx
- [ ] Implementar query para listar OS do parceiro autenticado
- [ ] Adicionar filtros por período, status e cliente
- [ ] Exibir horas trabalhadas e ganhos totais
- [ ] Mostrar detalhes de cada OS (cliente, horas, valor)
- [ ] Adicionar gráficos de horas e ganhos por período
- [ ] Implementar acesso restrito apenas para parceiros
- [ ] Testar dashboard com dados de múltiplos parceiros

## Tela de Login para Parceiros e Administração

### Página de Login
- [x] Criar componente de login unificado (LoginPage.tsx)
- [x] Integrar com OAuth Manus
- [x] Exibir informações do usuário após login
- [x] Implementar logout
- [x] Adicionar verificação de role do usuário

### Redirecionamento Baseado em Role
- [x] Criar lógica de redirecionamento no App.tsx
- [x] Admin/Manager → Dashboard de Administração
- [x] Partner → Dashboard de Parceiros
- [x] User → Página inicial ou dashboard pessoal
- [x] Proteger rotas por role

### Dashboard de Administração
- [x] Criar AdminDashboard.tsx
- [x] Exibir resumo de OS, parceiros e pagamentos
- [x] Adicionar links para gerenciamento de OS
- [x] Adicionar links para gerenciamento de parceiros
- [x] Adicionar links para gerenciamento de pagamentos
- [x] Integrar logout

### Dashboard de Parceiros
- [x] Criar PartnerDashboard.tsx (já existia)
- [x] Listar OS do parceiro autenticado
- [x] Exibir horas trabalhadas
- [x] Exibir ganhos totais
- [x] Adicionar filtros por período
- [x] Mostrar status de pagamentos

### Testes
- [ ] Testar fluxo de login
- [ ] Testar redirecionamento por role
- [ ] Testar acesso restrito a páginas
- [ ] Testar logout
