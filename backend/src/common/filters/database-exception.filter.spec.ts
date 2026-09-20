import { ArgumentsHost } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import { DatabaseExceptionFilter } from './database-exception.filter';

const mockHost = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const host = {
    switchToHttp: () => ({ getResponse: () => res }),
  } as unknown as ArgumentsHost;
  return { host, res };
};

const pgError = (code: string, constraint?: string) => {
  const err = new QueryFailedError('q', [], new Error('db'));
  Object.assign(err, { code, constraint });
  return err;
};

describe('DatabaseExceptionFilter', () => {
  const filter = new DatabaseExceptionFilter();

  // Un caso por código de Postgres: el mapeo es una tabla, y como tabla se
  // lee mejor que como cinco pruebas que solo cambian en dos valores.
  it.each([
    ['23505', 'unique_violation', 409],
    ['23P01', 'exclusion_violation', 409],
    ['23503', 'foreign_key_violation', 400],
    ['99999', 'código desconocido', 500],
  ])('%s (%s) -> %i', (code, _nombre, esperado) => {
    const { host, res } = mockHost();
    filter.catch(pgError(code as string), host);
    expect(res.status).toHaveBeenCalledWith(esperado);
  });

  it('usa el mensaje específico del constraint', () => {
    const { host, res } = mockHost();
    filter.catch(pgError('23505', 'uq_users_email'), host);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Ese correo ya está registrado' }),
    );
  });
});
