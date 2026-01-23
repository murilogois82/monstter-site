-- Script para aplicar permissões de administrador aos usuários especificados
-- Execute este script no banco de dados MySQL/TiDB após o deploy

-- Atualizar role para 'admin' para os e-mails especificados
UPDATE users 
SET role = 'admin' 
WHERE email IN (
  'murilo.gois@gmail.com',
  'mandamesmo@hotmail.com',
  'murilo.gois@ramo.com.br'
);

-- Verificar se os usuários foram atualizados
SELECT id, name, email, role, createdAt, lastSignedIn
FROM users
WHERE email IN (
  'murilo.gois@gmail.com',
  'mandamesmo@hotmail.com',
  'murilo.gois@ramo.com.br'
);

-- Caso os usuários ainda não existam no banco, eles serão criados automaticamente
-- no primeiro login via OAuth. Após o primeiro login, execute este script novamente
-- para garantir que recebam permissões de administrador.
