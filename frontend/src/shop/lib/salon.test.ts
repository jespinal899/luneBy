import { describe, expect, it } from 'vitest';

import { salon, whatsappLink } from './salon';

describe('whatsappLink', () => {
  it('usa el número de WhatsApp del salón', () => {
    expect(whatsappLink()).toBe(`https://wa.me/${salon.whatsapp}`);
  });

  it('añade el mensaje codificado como parámetro `text`', () => {
    expect(whatsappLink('Hola 💅')).toBe(
      `https://wa.me/${salon.whatsapp}?text=${encodeURIComponent('Hola 💅')}`,
    );
  });
});
