import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

const sendMock = jest.fn();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

import { ResendMailSender } from './resend-mail-sender.service';

describe('ResendMailSender', () => {
  const message = { to: 'a@b.com', subject: 'Hola', html: '<p>hi</p>' };

  const build = async (envValues: Record<string, string | undefined>) => {
    const config = { get: jest.fn((key: string) => envValues[key]) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        ResendMailSender,
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    return moduleRef.get(ResendMailSender);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sin RESEND_API_KEY no crea el cliente ni intenta enviar', async () => {
    const sender = await build({});

    await sender.send(message);

    expect(sendMock).not.toHaveBeenCalled();
  });

  it('con API key configurada, envía el correo con el remitente por defecto', async () => {
    const sender = await build({ RESEND_API_KEY: 'key-123' });
    sendMock.mockResolvedValue({ error: null });

    await sender.send(message);

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: message.to,
        subject: message.subject,
        html: message.html,
        from: 'Luné by Kelin <onboarding@resend.dev>',
      }),
    );
  });

  it('usa MAIL_FROM si está configurado', async () => {
    const sender = await build({
      RESEND_API_KEY: 'key-123',
      MAIL_FROM: 'Kelin <hola@luneby.com>',
    });
    sendMock.mockResolvedValue({ error: null });

    await sender.send(message);

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'Kelin <hola@luneby.com>' }),
    );
  });

  it('si Resend devuelve error, no lo relanza (solo lo registra)', async () => {
    const sender = await build({ RESEND_API_KEY: 'key-123' });
    sendMock.mockResolvedValue({ error: { message: 'fallo' } });

    await expect(sender.send(message)).resolves.toBeUndefined();
  });
});
