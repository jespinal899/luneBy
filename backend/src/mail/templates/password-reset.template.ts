const shell = (body: string): string => `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #2b2b2b; line-height: 1.6;">
    <h1 style="font-size: 20px; margin: 0 0 16px;">Luné by Kelin</h1>
    ${body}
  </div>
`;

/**
 * Correo con el código de recuperación.
 *
 * El código va en el cuerpo y NO en el asunto: los asuntos se ven en la
 * pantalla bloqueada del teléfono y en la lista del buzón, donde puede leerlo
 * cualquiera que tenga el aparato a la vista.
 */
export const buildPasswordResetEmail = (
  code: string,
  minutes: number,
): { subject: string; html: string } => ({
  subject: 'Tu código para recuperar la contraseña',
  html: shell(`
    <p>Pediste recuperar la contraseña de tu cuenta. Este es tu código:</p>
    <p style="font-size: 32px; letter-spacing: 8px; font-weight: 700; margin: 24px 0;">
      ${code}
    </p>
    <p>Vence en ${minutes} minutos y sirve una sola vez.</p>
    <p style="color: #6b6b6b; font-size: 14px;">
      Si no fuiste vos, podés ignorar este correo: tu contraseña no cambió y
      nadie puede cambiarla sin este código.
    </p>
  `),
});

/**
 * Aviso para quien pide recuperar una cuenta creada con Google.
 *
 * Esa cuenta no tiene contraseña, así que un código no le serviría de nada.
 * Se le dice por correo —donde sí puede leerlo— en vez de dejarla esperando
 * algo que nunca va a llegar.
 */
export const buildGoogleAccountEmail = (): {
  subject: string;
  html: string;
} => ({
  subject: 'Tu cuenta entra con Google',
  html: shell(`
    <p>
      Pediste recuperar la contraseña, pero tu cuenta se creó con Google, así
      que no tiene una contraseña propia.
    </p>
    <p>Para entrar, usá el botón <strong>Continuar con Google</strong>.</p>
    <p style="color: #6b6b6b; font-size: 14px;">
      Si no fuiste vos, podés ignorar este correo: no cambió nada en tu cuenta.
    </p>
  `),
});
