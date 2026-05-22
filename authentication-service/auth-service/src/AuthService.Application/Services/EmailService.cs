using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using AuthService.Application.Interfaces;
using System.Text.RegularExpressions;
using System.Text;
using System.Net;
using System.Net.Sockets;

namespace AuthService.Application.Services;

public class EmailService(IConfiguration configuration, ILogger<EmailService> logger) : IEmailService
{
    private static string BuildRestaurantEmail(
        string heading,
        string intro,
        string? buttonText,
        string? buttonUrl,
        string notice,
        Dictionary<string, string>? details = null)
    {
        var safeHeading = WebUtility.HtmlEncode(heading);
        var safeIntro = WebUtility.HtmlEncode(intro);
        var safeNotice = WebUtility.HtmlEncode(notice);
        var detailsHtml = new StringBuilder();

        if (details is not null)
        {
            foreach (var item in details)
            {
                detailsHtml.Append($@"
                    <tr>
                        <td style='padding:0 0 10px;'>
                            <div style='background:#1a120d;border:1px solid #4a3324;border-radius:8px;padding:12px 14px;'>
                                <div style='color:#d9aa55;font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;font-family:Arial,sans-serif;'>{WebUtility.HtmlEncode(item.Key)}</div>
                                <div style='color:#f8efe0;font-size:14px;line-height:1.45;font-weight:700;font-family:Arial,sans-serif;margin-top:5px;'>{WebUtility.HtmlEncode(item.Value)}</div>
                            </div>
                        </td>
                    </tr>");
            }
        }

        var buttonHtml = string.IsNullOrWhiteSpace(buttonText) || string.IsNullOrWhiteSpace(buttonUrl)
            ? string.Empty
            : $@"
                <table width='100%' cellpadding='0' cellspacing='0' role='presentation' style='margin-top:30px;border-collapse:collapse;'>
                    <tr>
                        <td align='center'>
                            <a href='{WebUtility.HtmlEncode(buttonUrl)}' style='display:inline-block;background:#d9aa55;color:#1c120d;font-family:Arial,sans-serif;font-size:14px;font-weight:800;letter-spacing:.5px;text-decoration:none;border-radius:8px;padding:15px 26px;min-width:210px;text-align:center;border:1px solid #f1cc83;'>{WebUtility.HtmlEncode(buttonText)}</a>
                        </td>
                    </tr>
                </table>
                <div style='margin-top:24px;padding:17px 18px;background:#2b1e16;border:1px solid #4a3324;border-radius:8px;font-family:Arial,sans-serif;'>
                    <p style='margin:0;color:#bcae98;font-size:13px;line-height:1.65;'>Si el boton no funciona, copia y pega este enlace en tu navegador:</p>
                    <a href='{WebUtility.HtmlEncode(buttonUrl)}' style='display:block;margin-top:9px;color:#d9aa55;font-size:13px;line-height:1.55;word-break:break-all;'>{WebUtility.HtmlEncode(buttonUrl)}</a>
                </div>";

        return $@"<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Gestion Restaurante</title>
</head>
<body style='margin:0;padding:0;background:#120d0a;color:#f8efe0;font-family:Georgia,""Times New Roman"",serif;'>
    <table width='100%' cellpadding='0' cellspacing='0' role='presentation' style='width:100%;background:#120d0a;border-collapse:collapse;'>
        <tr>
            <td align='center' style='padding:34px 14px;'>
                <table width='100%' cellpadding='0' cellspacing='0' role='presentation' style='max-width:660px;border-collapse:collapse;border:1px solid #4a3324;background:#211812;'>
                    <tr>
                        <td style='background:#43110f;border-top:5px solid #d9aa55;border-bottom:1px solid rgba(217,170,85,.38);padding:26px 30px 22px;'>
                            <table width='100%' cellpadding='0' cellspacing='0' role='presentation'>
                                <tr>
                                    <td width='72' style='vertical-align:middle;'>
                                        <div style='width:58px;height:58px;border:1px solid #d9aa55;background:#6f1d1b;border-radius:50%;text-align:center;line-height:58px;color:#d9aa55;font-family:Arial,sans-serif;font-size:18px;font-weight:800;letter-spacing:1px;'>GR</div>
                                    </td>
                                    <td style='vertical-align:middle;'>
                                        <div style='color:#d9aa55;font-family:Arial,sans-serif;font-size:12px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase;'>Gestion Restaurante</div>
                                        <div style='color:#f8efe0;font-size:24px;line-height:1.15;margin-top:5px;font-weight:700;'>Mesa, cocina y servicio en orden</div>
                                        <div style='color:#bcae98;font-family:Arial,sans-serif;font-size:12px;line-height:1.55;margin-top:7px;'>Notificaciones con el cuidado de una buena experiencia gastronomica.</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:30px;background:#211812;'>
                            <div style='color:#d9aa55;font-family:Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:1.9px;text-transform:uppercase;margin-bottom:10px;'>Servicio del restaurante</div>
                            <h1 style='margin:0;color:#f8efe0;font-size:31px;line-height:1.16;font-weight:700;'>{safeHeading}</h1>
                            <p style='margin:16px 0 0;color:#bcae98;font-family:Arial,sans-serif;font-size:15px;line-height:1.75;'>{safeIntro}</p>
                            <div style='height:1px;background:rgba(217,170,85,.38);margin:24px 0;'></div>
                            <table width='100%' cellpadding='0' cellspacing='0' role='presentation'>{detailsHtml}</table>
                            {buttonHtml}
                            <div style='margin-top:22px;padding:15px 16px;background:#19110d;border-left:4px solid #8a8f55;font-family:Arial,sans-serif;'>
                                <p style='margin:0;color:#bcae98;font-size:13px;line-height:1.7;'>{safeNotice}</p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:22px 30px 26px;background:#17100c;border-top:1px solid rgba(217,170,85,.38);font-family:Arial,sans-serif;'>
                            <p style='margin:0;color:#bcae98;font-size:12px;line-height:1.65;'>Correo automatico de Gestion Restaurante. Por favor no respondas a este mensaje.</p>
                            <p style='margin:8px 0 0;color:#8d7b65;font-size:12px;line-height:1.65;'>Carta digital, reservaciones, pedidos y reportes.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

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

        subject = "Verifica tu cuenta - Gestion Restaurante";
        body = BuildRestaurantEmail(
            "Bienvenido a Gestion Restaurante",
            $"Hola {username}, confirma tu correo para activar tu cuenta y entrar al panel del restaurante.",
            "Verificar mi cuenta",
            verificationUrl,
            "Este enlace expira en 24 horas. Si no creaste una cuenta, puedes ignorar este correo.",
            new Dictionary<string, string>
            {
                ["Modulo"] = "Activacion de cuenta",
                ["Vigencia"] = "24 horas"
            });

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

        subject = "Restablece tu contrasena - Gestion Restaurante";
        body = BuildRestaurantEmail(
            "Recupera tu acceso",
            $"Hola {username}, recibimos una solicitud para cambiar la contrasena de tu cuenta.",
            "Restablecer contrasena",
            resetUrl,
            "Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este correo.",
            new Dictionary<string, string>
            {
                ["Modulo"] = "Seguridad de cuenta",
                ["Vigencia"] = "1 hora"
            });

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

        subject = "Bienvenido a Gestion Restaurante";
        body = BuildRestaurantEmail(
            "Tu cuenta esta lista",
            $"Hola {username}, tu correo fue verificado correctamente. Ya puedes gestionar restaurantes, mesas, pedidos y reportes desde la plataforma.",
            null,
            null,
            "Gracias por formar parte de Gestion Restaurante.",
            new Dictionary<string, string>
            {
                ["Estado"] = "Cuenta verificada",
                ["Acceso"] = "Panel habilitado"
            });

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

