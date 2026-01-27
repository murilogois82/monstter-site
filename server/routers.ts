import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createContactMessage, getAllContactMessages, updateContactMessageStatus, createServiceOrder, updateServiceOrder, getServiceOrderById, getServiceOrdersByPartnerId, getAllServiceOrders, getServiceOrdersByStatus, createOSPayment, updateOSPayment, getPaymentsByPartnerId, createPartner, getPartnerByUserId, getAllPartners, getAllUsers, getUserById, updateUserRole, createUser, getDb } from "./db";
import { clientRouter } from "./clients";
import { sendServiceOrderEmail, notifyManagerOSSent } from "./email";
import { generateClientServiceReport, generatePartnerPaymentReport, getClientsWithOrdersInPeriod } from "./serviceReports";
import { calculateFinancialMetrics, getMonthlyComparison, getConsultantMetrics, getUtilizationRate } from "./financialMetrics";
import { z } from "zod";
import { reportSchedules } from "../drizzle/schema";
import { eq } from "drizzle-orm";

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

  // Service Orders Router
  serviceOrder: router({
    // Get next OS number (sequential)
    getNextOSNumber: protectedProcedure.query(async () => {
      const allOrders = await getAllServiceOrders();
      const lastOrder = allOrders[allOrders.length - 1];
      let nextNumber = 1;
      
      if (lastOrder && lastOrder.osNumber) {
        const match = lastOrder.osNumber.match(/(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      
      const year = new Date().getFullYear();
      return `OS-${year}-${String(nextNumber).padStart(4, '0')}`;
    }),

    // Create a new service order (partner)
    create: protectedProcedure
      .input(z.object({
        osNumber: z.string().min(1, "Número da OS é obrigatório"),
        clientId: z.number().optional(),
        clientName: z.string().min(2, "Nome do cliente é obrigatório"),
        clientEmail: z.string().email("E-mail do cliente inválido"),
        serviceType: z.string().min(2, "Tipo de serviço é obrigatório"),
        startDateTime: z.date(),
        interval: z.number().optional(),
        endDateTime: z.date().optional(),
        totalHours: z.number().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const partner = await getPartnerByUserId(ctx.user.id);
        if (!partner) {
          throw new Error("Parceiro não encontrado");
        }

        const result = await createServiceOrder({
          osNumber: input.osNumber,
          status: "draft",
          partnerId: partner.id,
          clientId: input.clientId || null,
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          serviceType: input.serviceType,
          startDateTime: input.startDateTime,
          interval: input.interval || null,
          endDateTime: input.endDateTime || null,
          totalHours: input.totalHours ? String(input.totalHours) : null,
          description: input.description || null,
        });

        if (!result) {
          throw new Error("Falha ao criar ordem de serviço");
        }

        return { success: true, id: result.id, osNumber: result.osNumber };
      }),

    // Update a service order
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "sent", "in_progress", "completed", "closed"]).optional(),
        endDateTime: z.date().optional(),
        totalHours: z.number().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await updateServiceOrder(input.id, {
          status: input.status as any,
          endDateTime: input.endDateTime || undefined,
          totalHours: input.totalHours ? String(input.totalHours) : undefined,
          description: input.description || undefined,
        });

        if (!result) {
          throw new Error("Falha ao atualizar ordem de serviço");
        }

        return { success: true, id: result.id };
      }),

    // Get a service order by ID
    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await getServiceOrderById(input);
      }),

    // List service orders for the current partner
    listMine: protectedProcedure.query(async ({ ctx }) => {
      const partner = await getPartnerByUserId(ctx.user.id);
      if (!partner) {
        return [];
      }
      return await getServiceOrdersByPartnerId(partner.id);
    }),

    // List all service orders (admin/manager only)
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
        throw new Error("Acesso negado");
      }
      return await getAllServiceOrders();
    }),

    // List service orders by status
    listByStatus: protectedProcedure
      .input(z.string())
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Acesso negado");
        }
        return await getServiceOrdersByStatus(input);
      }),

    // Send a service order (change status to sent)
    send: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const order = await getServiceOrderById(input);
        if (!order) {
          throw new Error("Ordem de serviço não encontrada");
        }

        const result = await updateServiceOrder(input, { status: "sent" });
        if (!result) {
          throw new Error("Falha ao enviar ordem de serviço");
        }

        // Enviar e-mail para o cliente
        await sendServiceOrderEmail(order, order.clientName, order.clientEmail);

        // Notificar gestor (e-mail fixo ou buscar do banco)
        await notifyManagerOSSent(order, "atendimento@monstter.com.br");

        return { success: true, id: result.id };
      }),

    // Close a service order
    close: protectedProcedure
      .input(z.object({
        id: z.number(),
        paymentAmount: z.number().optional(),
        paymentStatus: z.enum(["pending", "scheduled", "completed"]).optional(),
        paymentDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Acesso negado");
        }

        const order = await getServiceOrderById(input.id);
        if (!order) {
          throw new Error("Ordem de serviço não encontrada");
        }

        // Update order status to closed
        await updateServiceOrder(input.id, { status: "closed" });

        // Add payment information if provided
        if (input.paymentAmount) {
          await createOSPayment({
            osId: input.id,
            partnerId: order.partnerId,
            amount: String(input.paymentAmount),
            paymentStatus: (input.paymentStatus || "pending") as any,
            paymentDate: input.paymentDate || null,
            notes: input.notes || null,
          });
        }

        return { success: true, id: input.id };
      }),
  }),

  // Payments Router
  payment: router({
    // Get payments for the current partner
    listMine: protectedProcedure.query(async ({ ctx }) => {
      const partner = await getPartnerByUserId(ctx.user.id);
      if (!partner) {
        return [];
      }
      return await getPaymentsByPartnerId(partner.id);
    }),

    // Update payment status (admin/manager only)
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "scheduled", "completed"]),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Acesso negado");
        }

        const result = await updateOSPayment(input.id, { paymentStatus: input.status as any });
        if (!result) {
          throw new Error("Falha ao atualizar pagamento");
        }

        return { success: true, id: result.id };
      }),
  }),

  // Partners Router
  partner: router({
    // Get current partner info
    me: protectedProcedure.query(async ({ ctx }) => {
      return await getPartnerByUserId(ctx.user.id);
    }),

    // List all partners (admin only)
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado");
      }
      return await getAllPartners();
    }),
  }),

  // Clients Router (Admin/Manager only)
  clientManagement: clientRouter,

  // User Management Router (Admin only)
  userManagement: router({
    // List all users
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado");
      }
      return await getAllUsers();
    }),

    // Create a new user
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.string().email("E-mail inválido"),
        role: z.enum(["user", "admin", "partner", "manager"]),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado");
        }

        const result = await createUser({
          name: input.name,
          email: input.email,
          role: input.role,
        });

        if (!result) {
          throw new Error("Falha ao criar usuário");
        }

        return { success: true, id: result.id };
      }),

    // Update user role (activate/deactivate via role change)
    updateRole: protectedProcedure
      .input(z.object({
        id: z.number(),
        role: z.enum(["user", "admin", "partner", "manager"]),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado");
        }

        const result = await updateUserRole(input.id, input.role);
        if (!result) {
          throw new Error("Falha ao atualizar usuário");
        }

        return { success: true, id: result.id };
      }),

    // Get user by ID
    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado");
        }
        return await getUserById(input);
      }),
  }),

  // Service Reports Router
  serviceReports: router({
    // Generate client service report
    generateClientReport: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        periodStart: z.date(),
        periodEnd: z.date(),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Acesso negado");
        }
        return await generateClientServiceReport(input.clientId, input.periodStart, input.periodEnd);
      }),

    // Generate partner payment report
    generatePartnerReport: protectedProcedure
      .input(z.object({
        partnerId: z.number(),
        periodStart: z.date(),
        periodEnd: z.date(),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Acesso negado");
        }
        return await generatePartnerPaymentReport(input.partnerId, input.periodStart, input.periodEnd);
      }),

    // Get clients with orders in period
    getClientsInPeriod: protectedProcedure
      .input(z.object({
        periodStart: z.date(),
        periodEnd: z.date(),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Acesso negado");
        }
        return await getClientsWithOrdersInPeriod(input.periodStart, input.periodEnd);
      }),
  }),

  // Financial Metrics Router
  financialMetrics: router({
    getMetrics: protectedProcedure
      .input(z.object({
        periodStart: z.date(),
        periodEnd: z.date(),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Acesso negado");
        }
        return await calculateFinancialMetrics(input.periodStart, input.periodEnd);
      }),

    getMonthlyComparison: protectedProcedure
      .input(z.object({
        year: z.number().min(2020).max(2100),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Acesso negado");
        }
        return await getMonthlyComparison(input.year);
      }),

    getConsultantMetrics: protectedProcedure
      .input(z.object({
        periodStart: z.date(),
        periodEnd: z.date(),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Acesso negado");
        }
        return await getConsultantMetrics(input.periodStart, input.periodEnd);
      }),

    getUtilizationRate: protectedProcedure
      .input(z.object({
        periodStart: z.date(),
        periodEnd: z.date(),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Acesso negado");
        }
        return await getUtilizationRate(input.periodStart, input.periodEnd);
      }),
  }),

  // Report Scheduling Router
  reportSchedules: router({
    // Criar novo agendamento de relatório
    create: protectedProcedure
      .input(z.object({
        recipientEmail: z.string().email(),
        frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]),
        dayOfWeek: z.number().optional(),
        dayOfMonth: z.number().optional(),
        time: z.string().regex(/^\d{2}:\d{2}$/),
        reportType: z.enum(["financial", "service_orders", "payments", "all"]),
        includeCharts: z.enum(["yes", "no"]),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Acesso negado");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(reportSchedules).values({
          userId: ctx.user.id,
          recipientEmail: input.recipientEmail,
          frequency: input.frequency,
          dayOfWeek: input.dayOfWeek,
          dayOfMonth: input.dayOfMonth,
          time: input.time,
          reportType: input.reportType,
          includeCharts: input.includeCharts,
        });
        
        return { success: true };
      }),

    // Listar agendamentos do usuário
    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Acesso negado");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return await db.select().from(reportSchedules).where(eq(reportSchedules.userId, ctx.user.id));
      }),

    // Atualizar agendamento
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["active", "inactive"]).optional(),
        time: z.string().optional(),
        frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Acesso negado");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.update(reportSchedules)
          .set({
            status: input.status,
            time: input.time,
            frequency: input.frequency,
          })
          .where(eq(reportSchedules.id, input.id));
        
        return { success: true };
      }),

    // Deletar agendamento
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
          throw new Error("Acesso negado");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.delete(reportSchedules).where(eq(reportSchedules.id, input.id));
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

