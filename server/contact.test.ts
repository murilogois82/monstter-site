import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db functions
vi.mock("./db", () => ({
  createContactMessage: vi.fn(),
  getAllContactMessages: vi.fn(),
  updateContactMessageStatus: vi.fn(),
}));

import { createContactMessage, getAllContactMessages, updateContactMessageStatus } from "./db";

const mockedCreateContactMessage = vi.mocked(createContactMessage);
const mockedGetAllContactMessages = vi.mocked(getAllContactMessages);
const mockedUpdateContactMessageStatus = vi.mocked(updateContactMessageStatus);

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthenticatedContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "admin@monstter.com.br",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("contact.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a contact message successfully", async () => {
    const mockMessage = {
      id: 1,
      name: "João Silva",
      email: "joao@empresa.com",
      phone: "14981030777",
      company: "Empresa Teste",
      message: "Preciso de consultoria em TOTVS Protheus",
      status: "pending" as const,
      createdAt: new Date(),
    };

    mockedCreateContactMessage.mockResolvedValue(mockMessage);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "João Silva",
      email: "joao@empresa.com",
      phone: "14981030777",
      company: "Empresa Teste",
      message: "Preciso de consultoria em TOTVS Protheus",
    });

    expect(result).toEqual({ success: true, id: 1 });
    expect(mockedCreateContactMessage).toHaveBeenCalledWith({
      name: "João Silva",
      email: "joao@empresa.com",
      phone: "14981030777",
      company: "Empresa Teste",
      message: "Preciso de consultoria em TOTVS Protheus",
    });
  });

  it("validates required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "J", // Too short
        email: "invalid-email",
        phone: "123", // Too short
        message: "Short", // Too short
      })
    ).rejects.toThrow();
  });

  it("throws error when database fails", async () => {
    mockedCreateContactMessage.mockResolvedValue(null);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        name: "João Silva",
        email: "joao@empresa.com",
        phone: "14981030777",
        message: "Preciso de consultoria em TOTVS Protheus",
      })
    ).rejects.toThrow("Falha ao salvar mensagem");
  });
});

describe("contact.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all contact messages for authenticated users", async () => {
    const mockMessages = [
      {
        id: 1,
        name: "João Silva",
        email: "joao@empresa.com",
        phone: "14981030777",
        company: "Empresa Teste",
        message: "Preciso de consultoria",
        status: "pending" as const,
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "Maria Santos",
        email: "maria@empresa.com",
        phone: "14981030778",
        company: null,
        message: "Quero saber mais sobre os serviços",
        status: "read" as const,
        createdAt: new Date(),
      },
    ];

    mockedGetAllContactMessages.mockResolvedValue(mockMessages);

    const ctx = createAuthenticatedContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.list();

    expect(result).toEqual(mockMessages);
    expect(mockedGetAllContactMessages).toHaveBeenCalled();
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.contact.list()).rejects.toThrow();
  });
});

describe("contact.updateStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates message status for authenticated users", async () => {
    mockedUpdateContactMessageStatus.mockResolvedValue();

    const ctx = createAuthenticatedContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.updateStatus({
      id: 1,
      status: "read",
    });

    expect(result).toEqual({ success: true });
    expect(mockedUpdateContactMessageStatus).toHaveBeenCalledWith(1, "read");
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.updateStatus({
        id: 1,
        status: "read",
      })
    ).rejects.toThrow();
  });
});
