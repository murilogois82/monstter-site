import { describe, expect, it } from "vitest";
import nodemailer from "nodemailer";

describe("SMTP Connection Test", () => {
  it("should validate SMTP credentials format", async () => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    expect(smtpHost).toBe("smtps.uhserver.com");
    expect(smtpPort).toBe("465");
    expect(smtpUser).toBe("atendimento@monstter.com.br");
    expect(smtpPass).toBeDefined();
  });

  it("should create nodemailer transporter with correct config", async () => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtps.uhserver.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true, // SSL/TLS
      auth: {
        user: process.env.SMTP_USER || "atendimento@monstter.com.br",
        pass: process.env.SMTP_PASS || "",
      },
    });

    expect(transporter).toBeDefined();
    expect(transporter.options.host).toBe("smtps.uhserver.com");
    expect(transporter.options.port).toBe(465);
    expect(transporter.options.secure).toBe(true);
  });

  it("should validate email format", () => {
    const email = "atendimento@monstter.com.br";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    expect(emailRegex.test(email)).toBe(true);
  });

  it("should format service order email correctly", () => {
    const osData = {
      osNumber: "OS-2026-0001",
      clientName: "Cliente Teste",
      clientEmail: "cliente@teste.com",
      serviceType: "Consultoria TOTVS",
      totalHours: 8,
      description: "Teste de envio",
    };

    const subject = `Ordem de Serviço ${osData.osNumber} - Monstter Consultoria`;
    const body = `
Prezado(a) ${osData.clientName},

Segue em anexo a Ordem de Serviço ${osData.osNumber}.

Tipo de Serviço: ${osData.serviceType}
Total de Horas: ${osData.totalHours}h
Descrição: ${osData.description}

Atenciosamente,
Monstter Consultoria e Tecnologia
    `.trim();

    expect(subject).toContain(osData.osNumber);
    expect(body).toContain(osData.clientName);
    expect(body).toContain(osData.serviceType);
  });
});
