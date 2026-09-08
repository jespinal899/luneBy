import { useState, type FormEvent } from 'react';
import { Check, KeyRound, UserCog } from 'lucide-react';

import { apiErrorMessage } from '@/api/errors';
import { changePasswordRequest } from '@/auth/api/auth.actions';
import { useAuth } from '@/auth/context/use-auth';
import { Button } from '@/components/ui/button';
import { initials } from '@/lib/initials';

const inputClass =
  'w-full rounded-lg border border-brand/20 px-4 py-2.5 text-sm outline-none focus:border-brand/50';

export const PerfilPage = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [profileState, setProfileState] = useState<{
    saving: boolean;
    ok: boolean;
    error: string | null;
  }>({ saving: false, ok: false, error: null });

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [pwdState, setPwdState] = useState<{
    saving: boolean;
    ok: boolean;
    error: string | null;
  }>({ saving: false, ok: false, error: null });

  if (!user) return null;

  const handleProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileState({ saving: true, ok: false, error: null });
    try {
      await updateProfile({ fullName: fullName.trim(), phone: phone.trim() });
      setProfileState({ saving: false, ok: true, error: null });
    } catch (error) {
      setProfileState({
        saving: false,
        ok: false,
        error: apiErrorMessage(error, 'No se pudieron guardar los cambios.'),
      });
    }
  };

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) {
      setPwdState({
        saving: false,
        ok: false,
        error: 'La nueva contraseña y su confirmación no coinciden.',
      });
      return;
    }
    setPwdState({ saving: true, ok: false, error: null });
    try {
      await changePasswordRequest({
        currentPassword: pwd.current,
        newPassword: pwd.next,
      });
      setPwd({ current: '', next: '', confirm: '' });
      setPwdState({ saving: false, ok: true, error: null });
    } catch (error) {
      setPwdState({
        saving: false,
        ok: false,
        error: apiErrorMessage(error, 'No se pudo cambiar la contraseña.'),
      });
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 lg:px-8">
      <h1 className="font-display text-3xl text-brand-dark">Mi cuenta</h1>

      {/* Tarjeta de cuenta */}
      <div className="mt-8 flex items-center gap-4 rounded-2xl border border-brand/15 bg-cream p-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-semibold text-brand-foreground">
          {initials(user.fullName)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-brand-dark">
            {user.fullName}
          </p>
          <p className="truncate text-sm text-brand-dark/60">{user.email}</p>
          <span className="mt-1 inline-block rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
            {user.roles.includes('admin') ? 'Administradora' : 'Clienta'}
          </span>
        </div>
      </div>

      {/* Datos personales */}
      <form
        onSubmit={handleProfile}
        className="mt-8 rounded-2xl border border-brand/15 p-6"
      >
        <h2 className="flex items-center gap-2 font-display text-lg text-brand-dark">
          <UserCog className="h-5 w-5 text-brand" />
          Datos personales
        </h2>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-dark">
              Nombre
            </label>
            <input
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-dark">
              Teléfono
            </label>
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Opcional"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-dark/50">
              Correo
            </label>
            <input
              className={`${inputClass} cursor-not-allowed bg-muted/50`}
              value={user.email}
              disabled
            />
          </div>
        </div>

        {profileState.error && (
          <p className="mt-4 text-sm text-destructive">{profileState.error}</p>
        )}
        {profileState.ok && (
          <p className="mt-4 flex items-center gap-1.5 text-sm text-emerald-600">
            <Check className="h-4 w-4" /> Cambios guardados
          </p>
        )}

        <Button
          type="submit"
          disabled={profileState.saving}
          className="mt-5 rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand-dark"
        >
          {profileState.saving ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </form>

      {/* Cambiar contraseña */}
      <form
        onSubmit={handlePassword}
        className="mt-6 rounded-2xl border border-brand/15 p-6"
      >
        <h2 className="flex items-center gap-2 font-display text-lg text-brand-dark">
          <KeyRound className="h-5 w-5 text-brand" />
          Cambiar contraseña
        </h2>

        <div className="mt-5 space-y-4">
          <input
            type="password"
            className={inputClass}
            placeholder="Contraseña actual"
            value={pwd.current}
            onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
            required
            autoComplete="current-password"
          />
          <input
            type="password"
            className={inputClass}
            placeholder="Nueva contraseña"
            value={pwd.next}
            onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <input
            type="password"
            className={inputClass}
            placeholder="Repite la nueva contraseña"
            value={pwd.confirm}
            onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
            required
            autoComplete="new-password"
          />
        </div>

        {pwdState.error && (
          <p className="mt-4 text-sm text-destructive">{pwdState.error}</p>
        )}
        {pwdState.ok && (
          <p className="mt-4 flex items-center gap-1.5 text-sm text-emerald-600">
            <Check className="h-4 w-4" /> Contraseña actualizada
          </p>
        )}

        <Button
          type="submit"
          disabled={pwdState.saving}
          variant="outline"
          className="mt-5 rounded-full border-brand/25 px-6 text-brand-dark hover:bg-brand/5"
        >
          {pwdState.saving ? 'Actualizando…' : 'Actualizar contraseña'}
        </Button>
      </form>
    </div>
  );
};
