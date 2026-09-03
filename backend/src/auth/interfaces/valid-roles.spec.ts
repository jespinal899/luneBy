import { ValidRoles } from './valid-roles';

describe('ValidRoles', () => {
  it('define exactamente los roles admin y client', () => {
    expect(Object.values(ValidRoles)).toEqual(['admin', 'client']);
  });
});
