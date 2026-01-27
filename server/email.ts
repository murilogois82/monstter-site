import { ServiceOrder } from "../drizzle/schema";
import nodemailer from "nodemailer";

/**
 * Configuração do transportador SMTP
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtps.uhserver.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true, // SSL/TLS
  auth: {
    user: process.env.SMTP_USER || "atendimento@monstter.com.br",
    pass: process.env.SMTP_PASS || "",
  },
});

/**
 * Template HTML para o e-mail de Ordem de Serviço
 */
function generateOSEmailTemplate(order: ServiceOrder, clientName: string): string {
  const startDate = new Date(order.startDateTime).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const endDate = order.endDateTime
    ? new Date(order.endDateTime).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Não definida";

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(to right, #dc2626, #b91c1c);
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 20px 0;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #dc2626;
          border-bottom: 2px solid #dc2626;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .field {
          display: flex;
          margin-bottom: 10px;
        }
        .field-label {
          font-weight: bold;
          width: 150px;
          color: #555;
        }
        .field-value {
          flex: 1;
          color: #333;
        }
        .footer {
          background-color: #f4f4f4;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          border-radius: 0 0 8px 8px;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Ordem de Serviço #${order.osNumber}</h1>
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">Informações do Cliente</div>
            <div class="field">
              <div class="field-label">Cliente:</div>
              <div class="field-value">${clientName}</div>
            </div>
            <div class="field">
              <div class="field-label">E-mail:</div>
              <div class="field-value">${order.clientEmail}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Detalhes do Serviço</div>
            <div class="field">
              <div class="field-label">Tipo de Serviço:</div>
              <div class="field-value">${order.serviceType}</div>
            </div>
            <div class="field">
              <div class="field-label">Descrição:</div>
              <div class="field-value">${order.description || "Não informada"}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Período de Execução</div>
            <div class="field">
              <div class="field-label">Início:</div>
              <div class="field-value">${startDate}</div>
            </div>
            <div class="field">
              <div class="field-label">Término:</div>
              <div class="field-value">${endDate}</div>
            </div>
            <div class="field">
              <div class="field-label">Total de Horas:</div>
              <div class="field-value">${order.totalHours ? `${order.totalHours} horas` : "Não calculado"}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Status</div>
            <div class="field">
              <div class="field-label">Status Atual:</div>
              <div class="field-value">${getStatusLabel(order.status)}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Monstter Consultoria e Tecnologia</strong></p>
          <p>Consultoria Técnica Especializada em Sistemas TOTVS</p>
          <p>Este é um e-mail automático. Não responda diretamente.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Mapear status para rótulo legível
 */
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    draft: "Rascunho",
    sent: "Enviada",
    in_progress: "Em Progresso",
    completed: "Concluída",
    closed: "Encerrada",
  };
  return statusMap[status] || status;
}

/**
 * Enviar e-mail de Ordem de Serviço
 */
export async function sendServiceOrderEmail(
  order: ServiceOrder,
  clientName: string,
  recipientEmail: string
): Promise<boolean> {
  try {
    const htmlContent = generateOSEmailTemplate(order, clientName);

    await transporter.sendMail({
      from: '"Monstter Consultoria" <atendimento@monstter.com.br>',
      to: recipientEmail,
      subject: `Ordem de Serviço #${order.osNumber}`,
      html: htmlContent,
    });

    console.log("[Email] Ordem de Serviço enviada para:", recipientEmail);
    console.log("[Email] Número da OS:", order.osNumber);

    return true;
  } catch (error) {
    console.error("[Email] Erro ao enviar e-mail:", error);
    return false;
  }
}

/**
 * Enviar notificação para gestor quando OS é enviada
 */
export async function notifyManagerOSSent(
  order: ServiceOrder,
  managerEmail: string
): Promise<boolean> {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px; }
          .content { padding: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nova Ordem de Serviço Enviada</h1>
          </div>
          <div class="content">
            <p>Uma nova ordem de serviço foi enviada para o cliente.</p>
            <p><strong>Número da OS:</strong> ${order.osNumber}</p>
            <p><strong>Cliente:</strong> ${order.clientName}</p>
            <p><strong>Tipo de Serviço:</strong> ${order.serviceType}</p>
            <p><strong>Data de Envio:</strong> ${new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: '"Monstter Consultoria" <atendimento@monstter.com.br>',
      to: managerEmail,
      subject: `Nova OS Enviada - #${order.osNumber}`,
      html: htmlContent,
    });

    console.log("[Email] Notificação de OS enviada para gestor:", managerEmail);

    return true;
  } catch (error) {
    console.error("[Email] Erro ao notificar gestor:", error);
    return false;
  }
}

/**
 * Enviar e-mail genérico
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: '"Monstter Consultoria" <atendimento@monstter.com.br>',
      to,
      subject,
      html,
      text,
    });

    console.log("[Email] E-mail enviado para:", to);
    return true;
  } catch (error) {
    console.error("[Email] Erro ao enviar e-mail:", error);
    return false;
  }
}

/**
 * Verificar conexão SMTP
 */
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("[Email] Servidor SMTP conectado com sucesso");
    return true;
  } catch (error) {
    console.error("[Email] Erro ao conectar com servidor SMTP:", error);
    return false;
  }
}
