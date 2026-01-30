import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { clients } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const clientRouter = router({
  /**
   * Criar um novo cliente
   */
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        email: z.string().email("E-mail inválido"),
        phone: z.string().optional(),
        company: z.string().optional(),
        cnpj: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().max(2).optional(),
        zipCode: z.string().optional(),
        paymentType: z.enum(["fixed", "hourly"]).optional(),
        paymentValue: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verificar se usuário está autenticado e é admin
      if (!ctx.user || (ctx.user.role !== "admin" && ctx.user.role !== "manager")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Apenas administradores podem cadastrar clientes",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const [newClient] = await db.insert(clients).values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        document: input.cnpj,
        address: input.address,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        paymentType: input.paymentType || "hourly",
        chargedValue: input.paymentValue ? input.paymentValue : null,
        notes: input.notes,
        status: "active",
      });

      return { success: true, clientId: newClient.insertId };
    }),

  /**
   * Listar todos os clientes
   */
  listAll: publicProcedure.query(async ({ ctx }) => {
    // Verificar se usuário está autenticado
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Você precisa estar autenticado",
      });
    }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const allClients = await db.select().from(clients);
    return allClients;
  }),

  /**
   * Buscar cliente por ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Você precisa estar autenticado",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const [client] = await db.select().from(clients).where(eq(clients.id, input.id));
      
      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cliente não encontrado",
        });
      }

      return client;
    }),

  /**
   * Atualizar cliente
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        cnpj: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().max(2).optional(),
        zipCode: z.string().optional(),
        paymentType: z.enum(["fixed", "hourly"]).optional(),
        paymentValue: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== "admin" && ctx.user.role !== "manager")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Apenas administradores podem atualizar clientes",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const { id, cnpj, paymentValue, ...updateData } = input;
      
      const finalUpdateData: any = {
        ...updateData,
        document: cnpj,
        chargedValue: paymentValue || null,
      };
      
      // Remove undefined values
      Object.keys(finalUpdateData).forEach(key => 
        finalUpdateData[key] === undefined && delete finalUpdateData[key]
      );

      await db.update(clients).set(finalUpdateData).where(eq(clients.id, id));

      return { success: true };
    }),

  /**
   * Deletar cliente (soft delete - apenas inativa)
   */
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Apenas administradores podem deletar clientes",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      await db.update(clients).set({ status: "inactive" }).where(eq(clients.id, input.id));

      return { success: true };
    }),

  /**
   * Importar clientes em massa via CSV/Excel
   */
  importBulk: publicProcedure
    .input(
      z.object({
        clients: z.array(
          z.object({
            name: z.string(),
            email: z.string().email(),
            phone: z.string().optional(),
            company: z.string().optional(),
            document: z.string().optional(),
            address: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zipCode: z.string().optional(),
            notes: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verificar se usuário está autenticado e é admin
      if (!ctx.user || (ctx.user.role !== "admin" && ctx.user.role !== "manager")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Apenas administradores podem importar clientes",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const client of input.clients) {
        try {
          await db.insert(clients).values({
            name: client.name,
            email: client.email,
            phone: client.phone,
            company: client.company,
            document: client.document,
            address: client.address,
            city: client.city,
            state: client.state,
            zipCode: client.zipCode,
            notes: client.notes,
            status: "active",
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Erro ao importar ${client.name}: ${error}`);
        }
      }

      return results;
    }),
});
