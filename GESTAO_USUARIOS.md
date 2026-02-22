# Gestão de Usuários - Monstter Consultoria

## Visão Geral

O sistema de gestão de usuários permite que administradores gerenciem permissões, criem novos usuários e controlem o acesso às diferentes áreas do sistema.

## Estrutura de Permissões

### Roles Disponíveis

| Role | Descrição | Permissões |
|------|-----------|-----------|
| **Admin** | Administrador do Sistema | Acesso total ao sistema, gerenciamento de usuários, configurações, relatórios |
| **Manager** | Gestor | Acesso a relatórios, análises, gestão de parceiros e pagamentos |
| **Partner** | Parceiro/Consultor | Acesso ao dashboard de parceiros, suas ordens de serviço, horas trabalhadas |
| **User** | Usuário Comum | Acesso básico ao sistema, visualização de informações públicas |

## Como Acessar a Gestão de Usuários

1. Faça login com uma conta de **Administrador**
2. Clique em "Dashboard de Administração" ou vá para `/admin`
3. Clique no card "Usuários" ou acesse `/admin/users`

## Funcionalidades Principais

### 1. Listar Usuários

A tela principal mostra uma tabela com todos os usuários do sistema:

- **ID**: Identificador único do usuário
- **Nome**: Nome completo do usuário
- **E-mail**: Endereço de e-mail
- **Função**: Role/Permissão atual (Admin, Manager, Partner, User)
- **Método de Login**: Como o usuário faz login (OAuth ou Local)
- **Criado em**: Data de criação da conta
- **Último Acesso**: Última vez que o usuário acessou o sistema

### 2. Buscar e Filtrar Usuários

#### Busca por Nome/E-mail
- Use a barra de busca para encontrar usuários por nome ou e-mail
- A busca é em tempo real e case-insensitive

#### Filtrar por Função
- Use o dropdown "Filtrar por função" para ver apenas usuários com uma role específica
- Opções: Todas as funções, Usuário, Parceiro, Gestor, Administrador

### 3. Criar Novo Usuário

1. Clique no botão "+ Novo Usuário"
2. Preencha os campos obrigatórios:
   - **Nome Completo**: Nome do usuário
   - **E-mail**: Endereço de e-mail válido
   - **Função**: Selecione a role desejada
3. Clique em "Criar Usuário"

**Observações:**
- O e-mail deve ser válido e único no sistema
- O usuário receberá um e-mail de boas-vindas (quando configurado)
- A função pode ser alterada a qualquer momento

### 4. Editar Permissões de Usuário

1. Na tabela de usuários, clique no botão "Editar" da linha do usuário
2. Na caixa de diálogo, você pode alterar:
   - **Função**: Mude a role do usuário
3. Clique em "Salvar Alterações"

**Observações:**
- Apenas administradores podem alterar permissões
- As alterações entram em vigor imediatamente
- O usuário pode precisar fazer logout e login novamente para ver as mudanças

### 5. Exportar Relatório de Usuários

1. Clique no botão "Exportar" no canto superior direito
2. Um arquivo CSV será baixado com todos os usuários e suas informações
3. O arquivo pode ser aberto em Excel, Google Sheets ou qualquer editor de planilhas

## Descrição das Permissões por Role

### Admin (Administrador)
- Acesso total ao sistema
- Gerenciamento de usuários (criar, editar, deletar)
- Gerenciamento de parceiros
- Gerenciamento de clientes
- Gerenciamento de ordens de serviço
- Gerenciamento de pagamentos
- Visualização de relatórios financeiros
- Configuração do sistema

### Manager (Gestor)
- Acesso a relatórios e análises
- Gerenciamento de parceiros
- Gerenciamento de pagamentos
- Visualização de ordens de serviço
- Não pode gerenciar usuários
- Não pode acessar configurações do sistema

### Partner (Parceiro/Consultor)
- Visualização do próprio dashboard
- Visualização de suas ordens de serviço
- Visualização de horas trabalhadas
- Visualização de ganhos
- Não pode gerenciar outros usuários
- Acesso limitado a informações de outros parceiros

### User (Usuário Comum)
- Acesso básico ao sistema
- Visualização de informações públicas
- Não pode gerenciar nada
- Acesso limitado a recursos

## Fluxo de Trabalho Recomendado

### Para Onboarding de Novo Parceiro

1. **Criar Usuário**
   - Vá para `/admin/users`
   - Clique em "+ Novo Usuário"
   - Preencha nome, e-mail e selecione "Parceiro"
   - Clique em "Criar Usuário"

2. **Associar a Parceiro**
   - Vá para `/admin/partner-users`
   - Associe o novo usuário ao cadastro de parceiro

3. **Verificar Acesso**
   - O novo parceiro pode fazer login e acessar seu dashboard

### Para Promover Usuário a Gestor

1. Vá para `/admin/users`
2. Busque o usuário na tabela
3. Clique em "Editar"
4. Mude a função para "Gestor"
5. Clique em "Salvar Alterações"
6. O usuário terá acesso imediato aos recursos de gestor

### Para Remover Acesso de Usuário

1. Vá para `/admin/users`
2. Busque o usuário na tabela
3. Clique em "Editar"
4. Mude a função para "User" (acesso mínimo)
5. Clique em "Salvar Alterações"

## Proteção de Rotas

O sistema protege automaticamente as rotas administrativas:

| Rota | Roles Permitidas |
|------|------------------|
| `/admin` | Admin, Manager |
| `/admin/users` | Admin |
| `/admin/partners` | Admin, Manager |
| `/admin/service-orders` | Admin, Manager |
| `/admin/payments-dashboard` | Admin, Manager |
| `/admin/financial` | Admin, Manager |
| `/admin/clients` | Admin |
| `/partners/dashboard` | Partner |
| `/partners/service-orders` | Partner |

**Observação:** Se um usuário tentar acessar uma rota sem permissão, será redirecionado para a página inicial com uma mensagem de acesso negado.

## Boas Práticas

1. **Princípio do Menor Privilégio**: Atribua apenas as permissões necessárias para cada usuário
2. **Auditoria Regular**: Revise regularmente os usuários e suas permissões
3. **Documentação**: Mantenha registros de quem tem acesso a quê
4. **Segurança**: Não compartilhe credenciais de admin com usuários não-admin
5. **Backup**: Exporte regularmente o relatório de usuários para backup

## Troubleshooting

### Usuário não consegue fazer login
- Verifique se o e-mail está correto
- Verifique se o usuário foi criado no sistema
- Verifique se há problemas de conectividade

### Usuário não vê as mudanças de permissão
- Peça ao usuário para fazer logout e login novamente
- Verifique se a mudança foi salva corretamente
- Limpe o cache do navegador

### Erro ao criar usuário
- Verifique se o e-mail é válido
- Verifique se o e-mail já não existe no sistema
- Verifique se todos os campos obrigatórios foram preenchidos

## Contato e Suporte

Para dúvidas ou problemas com o sistema de gestão de usuários, entre em contato com:
- **E-mail**: consultoria@monstter.com.br
- **Telefone**: (14) 98103-0777

---

**Última atualização**: Fevereiro 2026
**Versão**: 1.0
