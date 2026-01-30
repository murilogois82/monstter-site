import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: string = "admin"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-admin",
    email: "admin@example.com",
    name: "Test Admin",
    loginMethod: "manus",
    role: role as any,
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

describe("Partner Router", () => {
  describe("partner.create", () => {
    it("should create a partner with banking information", async () => {
      const { ctx } = createAuthContext("admin");
      const caller = appRouter.createCaller(ctx);

      const input = {
        name: `Test Partner Company ${Date.now()}`,
        email: `partner-${Date.now()}@test.com`,
        phone: "(14) 98103-0777",
        cpf: "12345678901",
        bankName: "Banco do Brasil",
        bankAccount: "123456-7",
        bankRoutingNumber: "001",
        paymentType: "fixed" as const,
        paymentValue: 5000,
        notes: "Test partner with banking info",
      };

      const result = await caller.partner.create(input);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should create a partner without banking information", async () => {
      const { ctx } = createAuthContext("admin");
      const caller = appRouter.createCaller(ctx);

      const input = {
        name: `Test Partner No Bank ${Date.now()}`,
        email: `partner-nobank-${Date.now()}@test.com`,
        phone: "(14) 98103-0777",
        paymentType: "hourly" as const,
        paymentValue: 150,
      };

      const result = await caller.partner.create(input);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe("partner.update", () => {
    it("should update partner banking information", async () => {
      const { ctx } = createAuthContext("admin");
      const caller = appRouter.createCaller(ctx);

      // First create a partner
      const createInput = {
        name: `Test Partner Update ${Date.now()}`,
        email: `partner-update-${Date.now()}@test.com`,
        phone: "(14) 98103-0777",
        cpf: "98765432101",
        bankName: "Caixa Econômica",
        bankAccount: "654321-8",
        bankRoutingNumber: "104",
        paymentType: "hourly" as const,
        paymentValue: 150,
      };

      const createResult = await caller.partner.create(createInput);
      expect(createResult.success).toBe(true);

      // Get the list to find the created partner
      const listResult = await caller.partner.listAll();
      const createdPartner = listResult.find(
        (p) => p.email === createInput.email
      );

      if (!createdPartner) {
        throw new Error("Partner not found after creation");
      }

      // Update the partner
      const updateInput = {
        id: createdPartner.id,
        name: createdPartner.companyName || "Test Partner Company Updated",
        email: createdPartner.email,
        cpf: "11111111111",
        bankName: "Itaú Unibanco",
        bankAccount: "999999-9",
        bankRoutingNumber: "341",
        paymentValue: 200,
      };

      const updateResult = await caller.partner.update(updateInput);

      expect(updateResult).toBeDefined();
      expect(updateResult.success).toBe(true);
    });
  });

  describe("partner.listAll", () => {
    it("should list all partners", async () => {
      const { ctx } = createAuthContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.partner.listAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("partner access control", () => {
    it("should deny partner creation for non-admin users", async () => {
      const { ctx } = createAuthContext("user");
      const caller = appRouter.createCaller(ctx);

      const input = {
        name: "Unauthorized Partner",
        email: "unauthorized@test.com",
        phone: "(14) 98103-0777",
        paymentType: "fixed" as const,
        paymentValue: 5000,
      };

      try {
        await caller.partner.create(input);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toContain("Acesso negado");
      }
    });
  });
});
