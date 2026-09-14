import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { PerfilPage } from './PerfilPage';

const updateProfile = vi.fn();

vi.mock('@/auth/context/use-auth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      fullName: 'Kelin Ramírez',
      email: 'kelin@example.com',
      phone: '',
      roles: ['client'],
      hasPassword: true,
    },
    updateProfile,
  }),
}));

vi.mock('@/auth/api/auth.actions', () => ({
  changePasswordRequest: vi.fn(),
}));

describe('PerfilPage', () => {
  beforeEach(() => {
    updateProfile.mockReset();
    updateProfile.mockResolvedValue(undefined);
  });

  it('guarda los datos personales editados', async () => {
    const user = userEvent.setup();
    render(<PerfilPage />);

    const nameInput = screen.getByDisplayValue('Kelin Ramírez');
    await user.clear(nameInput);
    await user.type(nameInput, 'Kelin Rodríguez');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(updateProfile).toHaveBeenCalledWith({
      fullName: 'Kelin Rodríguez',
      phone: '',
    });
    expect(
      await screen.findByText('Cambios guardados'),
    ).toBeInTheDocument();
  });
});
