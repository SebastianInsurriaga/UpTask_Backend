import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string,
    name: string,
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async ( user : IEmail ) => {
        const info = await transporter.sendMail({
        from: `"UpTask" <${process.env.SMTP_FROM}>`,
        to: user.email,
        subject: 'Uptask - Confirmar cuenta',
        text: 'Uptask - Confirma tu cuenta',
        html: `
            <!DOCTYPE html>
            <html lang="es">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirma tu cuenta de UpTask</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #1F2937;">
            <table role="presentation" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-spacing: 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Body -->
                <tr>
                <td style="padding: 40px 20px; text-align: center;">
                    <h1 style="font-size: 28px; font-weight: bold; color: #111827; margin: 0 0 20px;">Confirmar cuenta</h1>
                    <p style="font-size: 16px; color: #4B5563; line-height: 24px; margin: 0 0 20px;">
                    Hola ${user.name},<br>
                    Has creado tu cuenta en UpTask, ya casi esta todo listo, solo debes confirmar tu cuenta. Haz clic en el botón para continuar.
                    </p>
                    <a href="${process.env.FRONTEND_URL}/auth/confirm-account" style="display: inline-block; padding: 12px 24px; background-color: #D946EF; color: #ffffff; text-decoration: none; font-size: 18px; font-weight: bold; border-radius: 4px; margin: 20px 0; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#C026D3'" onmouseout="this.style.backgroundColor='#D946EF'">
                    Confirmar cuenta
                    </a>
                    <p style="font-size: 16px; color: #4B5563; line-height: 24px; margin: 20px 0;">
                    Ingresa el siguiente código: <strong style="color: #111827;">${user.token}</strong>
                    </p>
                    <p style="font-size: 14px; color: #6B7280; line-height: 20px; margin: 20px 0;">
                    Este token expira en 10 minutos. Si no solicitaste esta acción, ignora este correo.
                    </p>
                </td>
                </tr>
                <!-- Footer -->
                <tr>
                <td style="padding: 20px; text-align: center; background-color: #1F2937;">
                    <p style="font-size: 14px; color: #D1D5DB; margin: 0;">
                        UpTask &copy; ${new Date().getFullYear()} | Este mensaje es automático, por favor no responda.
                    </p>
                </td>
                </tr>
            </table>
            </body>
            </html>
        `,
        });

        console.log('Mensaje enviado', info.messageId);
    }

    static sendPasswordResetToken = async (user: IEmail) => {
        const info = await transporter.sendMail({
        from: `"UpTask" <${process.env.SMTP_FROM}>`,
        to: user.email,
        subject: 'UpTask - Reestablece tu contraseña',
        text: 'UpTask - Reestablece tu contraseña',
        html: `
            <!DOCTYPE html>
            <html lang="es">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reestablece tu contraseña en UpTask</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #1F2937;">
            <table role="presentation" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-spacing: 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Body -->
                <tr>
                <td style="padding: 40px 20px; text-align: center;">
                    <h1 style="font-size: 28px; font-weight: bold; color: #111827; margin: 0 0 20px;">Reestablece tu contraseña</h1>
                    <p style="font-size: 16px; color: #4B5563; line-height: 24px; margin: 0 0 20px;">
                    Hola ${user.name},<br>
                    Has solicitado reestablecer tu contraseña en UpTask. Haz clic en el botón para continuar.
                    </p>
                    <a href="${process.env.FRONTEND_URL}/auth/new-password" style="display: inline-block; padding: 12px 24px; background-color: #D946EF; color: #ffffff; text-decoration: none; font-size: 18px; font-weight: bold; border-radius: 4px; margin: 20px 0; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#C026D3'" onmouseout="this.style.backgroundColor='#D946EF'">
                    Reestablecer contraseña
                    </a>
                    <p style="font-size: 16px; color: #4B5563; line-height: 24px; margin: 20px 0;">
                    Ingresa el siguiente código: <strong style="color: #111827;">${user.token}</strong>
                    </p>
                    <p style="font-size: 14px; color: #6B7280; line-height: 20px; margin: 20px 0;">
                    Este token expira en 10 minutos. Si no solicitaste esta acción, ignora este correo.
                    </p>
                </td>
                </tr>
                <!-- Footer -->
                <tr>
                <td style="padding: 20px; text-align: center; background-color: #1F2937;">
                    <p style="font-size: 14px; color: #D1D5DB; margin: 0;">
                        UpTask &copy; ${new Date().getFullYear()} | Este mensaje es automático, por favor no responda.
                    </p>
                </td>
                </tr>
            </table>
            </body>
            </html>
        `,
        });

        console.log('Mensaje enviado', info.messageId);
    }
}