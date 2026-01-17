import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createContactMessage, getAllContactMessages, updateContactMessageStatus } from "./db";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Contact Messages Router
  contact: router({
    // Public endpoint to submit a contact message
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.string().email("E-mail inválido"),
        phone: z.string().min(10, "Telefone inválido"),
        company: z.string().optional(),
        message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
      }))
      .mutation(async ({ input }) => {
        const result = await createContactMessage({
          name: input.name,
          email: input.email,
          phone: input.phone,
          company: input.company || null,
          message: input.message,
        });
        
        if (!result) {
          throw new Error("Falha ao salvar mensagem. Tente novamente.");
        }
        
        return { success: true, id: result.id };
      }),
    
    // Protected endpoint to list all messages (admin only)
    list: protectedProcedure.query(async () => {
      return await getAllContactMessages();
    }),
    
    // Protected endpoint to update message status
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "read", "replied"]),
      }))
      .mutation(async ({ input }) => {
        await updateContactMessageStatus(input.id, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
