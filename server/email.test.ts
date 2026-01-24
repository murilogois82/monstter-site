import { describe, expect, it } from "vitest";
import { verifyEmailConnection } from "./email";

describe("email.verifyConnection", () => {
  it("deve conectar com sucesso ao servidor SMTP", async () => {
    const result = await verifyEmailConnection();
    
    expect(result).toBe(true);
  }, 10000); // Timeout de 10 segundos para conexão SMTP
});
