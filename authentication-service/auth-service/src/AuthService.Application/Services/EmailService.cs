using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using AuthService.Application.Interfaces;
using System.Text.RegularExpressions;
using System.Text;
using System.Net.Sockets;

namespace AuthService.Application.Services;

public class EmailService(IConfiguration configuration, ILogger<EmailService> logger) : IEmailService
{
    public async Task SendEmailVerificationAsync(string email, string username, string token)
    {
        var subject = "Verifica tu correo electrónico - Kinal Sports";
        var verificationUrl = $"{configuration["AppSettings:FrontendUrl"]}/verify-email?token={token}";

        var body = $@"
            <h2>¡Bienvenido a Kinal Sports, {username}!</h2>
            <p>Por favor, verifica tu correo electrónico para tu cuenta de Kinal Sports haciendo clic en el siguiente enlace:</p>
            <a href='{verificationUrl}' style='background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
                Verificar correo
            </a>
            <p>Si no puedes hacer clic en el enlace, copia y pega esta URL en tu navegador:</p>
            <p>{verificationUrl}</p>
            <p>Este enlace expirará en 24 horas.</p>
            <p>Si no creaste una cuenta, ignora este correo.</p>
        ";

        await SendEmailAsync(email, subject, body);
    }

    public async Task SendPasswordResetAsync(string email, string username, string token)
    {
        var subject = "Restablece tu contraseña - Kinal Sports";
        var resetUrl = $"{configuration["AppSettings:FrontendUrl"]}/reset-password?token={token}";

        var body = $@"
            <h2>Solicitud de restablecimiento de contraseña - Kinal Sports</h2>
            <p>Hola {username},</p>
            <p>Este mensaje es de Kinal Sports.</p>
            <p>Solicitaste restablecer tu contraseña. Haz clic en el siguiente enlace para restablecerla:</p>
            <a href='{resetUrl}' style='background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
                Restablecer contraseña
            </a>
            <p>Si no puedes hacer clic en el enlace, copia y pega esta URL en tu navegador:</p>
            <p>{resetUrl}</p>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste esto, ignora este correo y tu contraseña permanecerá sin cambios.</p>
        ";

        await SendEmailAsync(email, subject, body);
    }

    public async Task SendWelcomeEmailAsync(string email, string username)
    {
        var subject = "¡Bienvenido a Kinal Sports!";

        var body = $@"
            <h2>¡Bienvenido a Kinal Sports, {username}!</h2>
            <p>Tu cuenta ha sido verificada y activada exitosamente.</p>
            <p>Ahora puedes disfrutar de todas las funciones de nuestra plataforma.</p>
            <p>Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.</p>
            <p>¡Gracias por unirte a nosotros!</p>
        ";

        await SendEmailAsync(email, subject, body);
    }

    private async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpSettings = configuration.GetSection("SmtpSettings");

        try
        {
            // Verificar si el email está habilitado
            var enabled = bool.Parse(smtpSettings["Enabled"] ?? "true");
            if (!enabled)
            {
                logger.LogInformation("Email disabled in configuration. Skipping send");
                return;
            }

            var useFileSink = bool.Parse(smtpSettings["UseFileSink"] ?? "false");
            if (useFileSink)
            {
                await WriteEmailToFileAsync(to, subject, body);
                logger.LogInformation("Email written to local outbox for {Recipient}", to);
                return;
            }

            // Validar configuración
            var host = smtpSettings["Host"];
            var portString = smtpSettings["Port"];
            var username = smtpSettings["Username"];
            var password = smtpSettings["Password"];
            var fromEmail = smtpSettings["FromEmail"];
            var fromName = smtpSettings["FromName"];

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                logger.LogError("SMTP settings are not properly configured");
                throw new InvalidOperationException("SMTP settings are not properly configured");
            }

            // Avoid logging sensitive SMTP details

            var port = int.Parse(portString ?? "587");

            try
            {
                using var client = new SmtpClient();

                // Configurar timeout
                var timeoutMs = int.Parse(smtpSettings["Timeout"] ?? "30000");
                client.Timeout = timeoutMs;

                // FIX: Bypass SSL (Cloudinary, etc.)
                client.CheckCertificateRevocation = false;
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                // Verificar configuración de SSL implícito
                var useImplicitSsl = bool.Parse(smtpSettings["UseImplicitSsl"] ?? "false");

                try
                {
                    // Configuración específica por puerto y SSL
                    if (useImplicitSsl || port == 465)
                    {
                        await client.ConnectAsync(host, port, SecureSocketOptions.SslOnConnect);
                    }
                    else if (port == 587)
                    {
                        await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
                    }
                    else
                    {
                        await client.ConnectAsync(host, port, SecureSocketOptions.Auto);
                    }
                }
                catch (SocketException ex)
                {
                    // Fallback estilo Gmail (como en otros envíos): StartTls en 587
                    logger.LogWarning(ex, "SMTP primary connection failed. Retrying with StartTls on port 587");
                    await client.DisconnectAsync(true);
                    await client.ConnectAsync(host, 587, SecureSocketOptions.StartTls);
                }

                // Autenticación
                await client.AuthenticateAsync(username, password);

                // Crear mensaje con MimeKit
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;
                message.Body = new TextPart("html") { Text = body };

                // Enviar
                await client.SendAsync(message);
                logger.LogInformation("Email sent successfully");

                await client.DisconnectAsync(true);
                logger.LogInformation("Email pipeline completed");
            }
            catch (MailKit.Security.AuthenticationException authEx)
            {
                logger.LogError(authEx, "Gmail authentication failed. Check app password.");
                throw new InvalidOperationException($"Gmail authentication failed: {authEx.Message}. Please check your app password.", authEx);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send email");
                throw;
            }
            logger.LogInformation("Email processed");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email");

            // Verificar si usar fallback
            var useFallback = bool.Parse(smtpSettings["UseFallback"] ?? "false");
            if (useFallback)
            {
                logger.LogWarning("Using email fallback. SMTP failed for {Recipient} ({Subject})", to, subject);

                var match = Regex.Match(body, "https?://[^\\s\"']+");
                if (match.Success)
                {
                    logger.LogWarning("Verification/Reset link (fallback): {Url}", match.Value);
                }
                else
                {
                    logger.LogWarning("Email body (fallback): {Body}", body);
                }

                await WriteEmailToFileAsync(to, subject, body);
                return; // No fallar, solo logear
            }

            throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
        }
    }

    private async Task WriteEmailToFileAsync(string to, string subject, string body)
    {
        var smtpSettings = configuration.GetSection("SmtpSettings");
        var outboxPath = smtpSettings["OutboxPath"] ?? "logs/email-outbox";

        Directory.CreateDirectory(outboxPath);

        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd-HHmmss-fff");
        var safeTo = Regex.Replace(to, "[^a-zA-Z0-9_.@-]", "_");
        var filePath = Path.Combine(outboxPath, $"email-{timestamp}-{safeTo}.txt");

        var builder = new StringBuilder();
        builder.AppendLine($"To: {to}");
        builder.AppendLine($"Subject: {subject}");
        builder.AppendLine($"Timestamp (UTC): {DateTime.UtcNow:O}");
        builder.AppendLine("---");
        builder.AppendLine(body);

        await File.WriteAllTextAsync(filePath, builder.ToString());
    }
}

