/**
 * Middleware para auto-promover usuários específicos a administradores
 * Este arquivo garante que os e-mails especificados sempre tenham role 'admin'
 */

import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Lista de e-mails que devem ter permissão total de administrador
const ADMIN_EMAILS = [
  "murilo.gois@gmail.com",
  "mandamesmo@hotmail.com",
  "murilo.gois@ramo.com.br",
];

/**
 * Verifica e atualiza a role do usuário para 'admin' se o e-mail estiver na lista
 * @param email - E-mail do usuário
 * @param userId - ID do usuário no banco de dados
 */
export async function ensureAdminRole(email: string | null | undefined, userId: number) {
  if (!email) return;

  // Verificar se o e-mail está na lista de administradores
  const isAdminEmail = ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.toLowerCase() === email.toLowerCase()
  );

  if (isAdminEmail) {
    try {
      const db = await getDb();
      if (!db) {
        console.warn("[AdminMiddleware] Banco de dados não disponível");
        return;
      }

      // Atualizar role para 'admin' se ainda não for
      await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.id, userId));

      console.log(`✅ Usuário ${email} promovido a administrador`);
    } catch (error) {
      console.error(`❌ Erro ao promover usuário ${email} a administrador:`, error);
    }
  }
}

/**
 * Verifica se um e-mail deve ter permissões de administrador
 * @param email - E-mail a ser verificado
 * @returns true se o e-mail deve ser admin, false caso contrário
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.toLowerCase() === email.toLowerCase()
  );
}
