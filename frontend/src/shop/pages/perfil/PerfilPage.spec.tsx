import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { changePasswordRequest } from '@/auth/api/auth.actions';

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
    vi.mocked(changePasswordRequest).mockReset();
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

  it('si falla el guardado lo dice en vez de fingir que se guardó', async () => {
    updateProfile.mockRejectedValue(new Error('sin red'));
    const user = userEvent.setup();
    render(<PerfilPage />);

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(
      await screen.findByText('No se pudieron guardar los cambios.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Cambios guardados')).not.toBeInTheDocument();
  });

  it('recorta los espacios del nombre y el teléfono antes de mandarlos', async () => {
    const user = userEvent.setup();
    render(<PerfilPage />);

    await user.type(screen.getByLabelText('Teléfono'), '  9999-9999  ');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(updateProfile).toHaveBeenCalledWith({
      fullName: 'Kelin Ramírez',
      phone: '9999-9999',
    });
  });

  it('el correo se muestra pero no se puede editar', () => {
    render(<PerfilPage />);
    expect(screen.getByLabelText('Correo')).toBeDisabled();
  });

  describe('cambio de contraseña', () => {
    const llenar = async (
      user: ReturnType<typeof userEvent.setup>,
      next: string,
      confirm: string,
    ) => {
      await user.type(
        screen.getByPlaceholderText('Contraseña actual'),
        'Vieja123',
      );
      await user.type(screen.getByPlaceholderText('Nueva contraseña'), next);
      await user.type(
        screen.getByPlaceholderText('Repite la nueva contraseña'),
        confirm,
      );
      await user.click(
        screen.getByRole('button', { name: /actualizar contraseña/i }),
      );
    };

    it('no la manda al backend si la confirmación no coincide', async () => {
      const user = userEvent.setup();
      render(<PerfilPage />);

      await llenar(user, 'Nueva123', 'Nueva124');

      expect(
        await screen.findByText(
          'La nueva contraseña y su confirmación no coinciden.',
        ),
      ).toBeInTheDocument();
      expect(changePasswordRequest).not.toHaveBeenCalled();
    });

    it('la cambia y limpia los campos', async () => {
      vi.mocked(changePasswordRequest).mockResolvedValue({ message: 'ok' });
      const user = userEvent.setup();
      render(<PerfilPage />);

      await llenar(user, 'Nueva123', 'Nueva123');

      expect(
        await screen.findByText('Contraseña actualizada'),
      ).toBeInTheDocument();
      expect(changePasswordRequest).toHaveBeenCalledWith({
        currentPassword: 'Vieja123',
        newPassword: 'Nueva123',
      });
      expect(screen.getByPlaceholderText('Nueva contraseña')).toHaveValue('');
    });

    it('si el backend la rechaza, muestra el motivo', async () => {
      vi.mocked(changePasswordRequest).mockRejectedValue(new Error('mal'));
      const user = userEvent.setup();
      render(<PerfilPage />);

      await llenar(user, 'Nueva123', 'Nueva123');

      expect(
        await screen.findByText('No se pudo cambiar la contraseña.'),
      ).toBeInTheDocument();
    });
  });
});
