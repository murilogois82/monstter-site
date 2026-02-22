import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  userName?: string
) {
  try {
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: SMTP_USER,
      to: email,
      subject: "Redefinir Sua Senha - Monstter",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1a1a1a; color: #fff; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
              .footer { background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #666; }
              .button { display: inline-block; background-color: #dc2626; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Monstter - Recuperação de Senha</h1>
              </div>
              <div class="content">
                <p>Olá${userName ? `, ${userName}` : ""},</p>
                
                <p>Você solicitou a redefinição de sua senha. Clique no botão abaixo para criar uma nova senha:</p>
                
                <center>
                  <a href="${resetUrl}" class="button">Redefinir Senha</a>
                </center>
                
                <p>Ou copie e cole este link no seu navegador:</p>
                <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 3px;">
                  ${resetUrl}
                </p>
                
                <div class="warning">
                  <strong>⚠️ Aviso de Segurança:</strong>
                  <ul>
                    <li>Este link expira em 24 horas</li>
                    <li>Se você não solicitou esta redefinição, ignore este e-mail</li>
                    <li>Nunca compartilhe este link com ninguém</li>
                  </ul>
                </div>
                
                <p>Se você tiver problemas ao clicar no botão, copie e cole o link acima no seu navegador.</p>
                
                <p>Atenciosamente,<br/>Equipe Monstter</p>
              </div>
              <div class="footer">
                <p>Este é um e-mail automático. Por favor, não responda a este e-mail.</p>
                <p>&copy; 2026 Monstter Consultoria e Tecnologia. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Olá${userName ? `, ${userName}` : ""},

Você solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova senha:

${resetUrl}

Este link expira em 24 horas.

Se você não solicitou esta redefinição, ignore este e-mail.

Atenciosamente,
Equipe Monstter
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("[Email] Password reset email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Email] Failed to send password reset email:", error);
    throw error;
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration() {
  try {
    await transporter.verify();
    console.log("[Email] SMTP connection verified successfully");
    return { success: true, message: "SMTP connection verified" };
  } catch (error) {
    console.error("[Email] SMTP connection failed:", error);
    throw error;
  }
}
