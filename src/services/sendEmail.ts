import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { appConfig } from '../configs';

const { client_id, client_secret, redirect_uris, refresh_token } = appConfig.email;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

oAuth2Client.setCredentials({ refresh_token: refresh_token });

export async function sendMail({ toEmail }: { toEmail: string }) {
  try {
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'Solicitud de Restablecimiento de Contraseña <your authorized email everytel2023@gmail.com>',
      to: toEmail,
      subject: 'Solicitud de Restablecimiento de Contraseña',
      text: 'Solicito amablemente restablecer la contraseña de mi cuenta, necesito asistencia urgente para acceder. Agradezco su pronta ayuda y soporte en este proceso. Gracias por su atención.',
      html: `<p>
      Estimado equipo de soporte,
      Espero que este mensaje les encuentre bien. Me dirijo a ustedes para solicitar amablemente la restauración de mi contraseña en mi cuenta [TuNombreDeUsuario] en [NombreDeLaPlataforma/Servicio].
      Recientemente he experimentado dificultades para acceder a mi cuenta debido a la pérdida u olvido de la contraseña. Por favor, ¿podrían asistirme en el restablecimiento de la misma? Agradezco de antemano su pronta asistencia para solucionar este inconveniente.
      
      A continuación, proporciono la información requerida para proceder con el restablecimiento de la contraseña:
      Nombre de usuario: [TuNombreDeUsuario]
      Dirección de correo electrónico asociada a la cuenta: [TuCorreoElectrónicoAsociado]
      
      Agradezco su pronta atención a este asunto. Si necesitan información adicional o cualquier otro detalle, por favor no duden en contactarme.
      Muchas gracias por su ayuda.
      
      Atentamente,
      [Tu Nombre]
      [Tu Número de Contacto (opcional)]
      
      </p>`,
    };

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'everytel2023@gmail.com',
        clientId: client_id,
        clientSecret: client_secret,
        refreshToken: refresh_token,
        // accessToken: accessToken
      },
    });
    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error sending email: ${error.message}`);
    } else {
      throw new Error('Ocurrio un error durante el envio del email.');
    }
  }
}
