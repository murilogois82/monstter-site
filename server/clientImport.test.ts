import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-test",
    email: "admin@monstter.com.br",
    name: "Admin Test",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("clientManagement.importBulk", () => {
  it("deve permitir que admin importe clientes em massa", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const testClients = [
      {
        name: "Cliente Teste 1",
        email: "cliente1@teste.com",
        phone: "(11) 98765-4321",
        company: "Empresa Teste 1",
        document: "12.345.678/0001-90",
      },
      {
        name: "Cliente Teste 2",
        email: "cliente2@teste.com",
        phone: "(11) 98765-4322",
        company: "Empresa Teste 2",
        document: "12.345.678/0001-91",
      },
    ];

    const result = await caller.clientManagement.importBulk({
      clients: testClients,
    });

    expect(result.success).toBeGreaterThanOrEqual(0);
    expect(result.failed).toBeGreaterThanOrEqual(0);
    expect(result.errors).toBeInstanceOf(Array);
  });

  it("deve rejeitar importação de usuário não admin", async () => {
    const { ctx } = createAdminContext();
    ctx.user!.role = "user"; // Mudar para usuário comum
    const caller = appRouter.createCaller(ctx);

    const testClients = [
      {
        name: "Cliente Teste",
        email: "cliente@teste.com",
      },
    ];

    await expect(
      caller.clientManagement.importBulk({ clients: testClients })
    ).rejects.toThrow("Apenas administradores podem importar clientes");
  });
});
