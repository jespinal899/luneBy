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

  it('unique_violation -> 409', () => {
    const { host, res } = mockHost();
    filter.catch(pgError('23505'), host);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('usa el mensaje específico del constraint', () => {
    const { host, res } = mockHost();
    filter.catch(pgError('23505', 'uq_users_email'), host);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Ese correo ya está registrado' }),
    );
  });

  it('exclusion_violation -> 409', () => {
    const { host, res } = mockHost();
    filter.catch(pgError('23P01'), host);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('foreign_key_violation -> 400', () => {
    const { host, res } = mockHost();
    filter.catch(pgError('23503'), host);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('código desconocido -> 500', () => {
    const { host, res } = mockHost();
    filter.catch(pgError('99999'), host);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
