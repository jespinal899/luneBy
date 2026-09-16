import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';

import {
    forgotPasswordRequest,
    resetPasswordRequest,
    verifyResetCodeRequest,
} from '@/auth/api/auth.actions';
import { apiErrorMessage } from '@/api/errors';
import { CustomLogo } from '@/components/Custom/CustomLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Paso = 'correo' | 'codigo' | 'contrasena';

/**
 * Recuperar la contraseña con un código enviado al correo.
 *
 * Los tres pasos viven en una sola pantalla y no en tres rutas: el proceso
 * depende de un código que vence a los 15 minutos, así que recargar o
 * compartir un enlace intermedio no serviría de nada.
 */
export const RecuperarPage = () => {
    const navigate = useNavigate();

    const [paso, setPaso] = useState<Paso>('correo');
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');

    const pedirCodigo = useMutation({
        mutationFn: () => forgotPasswordRequest(email),
        onSuccess: () => setPaso('codigo'),
    });

    const verificar = useMutation({
        mutationFn: (code: string) => verifyResetCodeRequest(email, code),
        onSuccess: ({ resetToken: token }) => {
            setResetToken(token);
            setPaso('contrasena');
        },
    });

    const cambiar = useMutation({
        mutationFn: (newPassword: string) =>
            resetPasswordRequest(resetToken, newPassword),
        onSuccess: () =>
            navigate('/auth/login', {
                replace: true,
                state: { justReset: true },
            }),
    });

    const [error, setError] = useState<string | null>(null);

    const handleCorreo = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        pedirCodigo.mutate();
    };

    const handleCodigo = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        verificar.mutate(((form.get('code') as string | null) ?? '').trim());
    };

    const handleContrasena = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const nueva = (form.get('password') as string | null) ?? '';
        const repetida = (form.get('password2') as string | null) ?? '';

        // Se comprueba acá y no en el backend porque es un error de tipeo, no
        // una regla del negocio: se avisa sin ir y volver al servidor.
        if (nueva !== repetida) {
            setError('Las dos contraseñas no coinciden.');
            return;
        }
        setError(null);
        cambiar.mutate(nueva);
    };

    const mensajeDeError =
        error ??
        (pedirCodigo.isError
            ? apiErrorMessage(pedirCodigo.error, 'No se pudo enviar el código.')
            : null) ??
        (verificar.isError
            ? apiErrorMessage(verificar.error, 'El código no es válido.')
            : null) ??
        (cambiar.isError
            ? apiErrorMessage(cambiar.error, 'No se pudo cambiar la contraseña.')
            : null);

    return (
        <div className="flex min-h-svh items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="mb-8 flex justify-center">
                    <CustomLogo />
                </div>

                <Card>
                    <CardContent className="p-6">
                        <h1 className="text-xl font-semibold">
                            Recuperar contraseña
                        </h1>

                        {mensajeDeError && (
                            <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                {mensajeDeError}
                            </p>
                        )}

                        {paso === 'correo' && (
                            <form onSubmit={handleCorreo} className="mt-6 grid gap-4">
                                <p className="text-sm text-muted-foreground">
                                    Escribe tu correo y te enviamos un código de 6
                                    dígitos.
                                </p>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Correo</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" disabled={pedirCodigo.isPending}>
                                    {pedirCodigo.isPending
                                        ? 'Enviando…'
                                        : 'Enviarme el código'}
                                </Button>
                            </form>
                        )}

                        {paso === 'codigo' && (
                            <form onSubmit={handleCodigo} className="mt-6 grid gap-4">
                                {/*
                                  No dice "te enviamos un código" en pasado
                                  afirmativo: si ese correo no tiene cuenta, no
                                  llegó nada, y el backend responde igual a
                                  propósito para no delatar quién está registrado.
                                */}
                                <p className="text-sm text-muted-foreground">
                                    Si <strong>{email}</strong> tiene una cuenta, le
                                    llegó un código. Vence en 15 minutos.
                                </p>
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Código</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        required
                                        placeholder="123456"
                                    />
                                </div>
                                <Button type="submit" disabled={verificar.isPending}>
                                    {verificar.isPending
                                        ? 'Comprobando…'
                                        : 'Continuar'}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => pedirCodigo.mutate()}
                                    disabled={pedirCodigo.isPending}
                                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                                >
                                    No me llegó, enviar otro
                                </button>
                            </form>
                        )}

                        {paso === 'contrasena' && (
                            <form
                                onSubmit={handleContrasena}
                                className="mt-6 grid gap-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Nueva contraseña</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        minLength={6}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Al menos 6 caracteres, con una mayúscula, una
                                        minúscula y un número.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password2">Repetir contraseña</Label>
                                    <Input
                                        id="password2"
                                        name="password2"
                                        type="password"
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={cambiar.isPending}>
                                    {cambiar.isPending
                                        ? 'Guardando…'
                                        : 'Cambiar contraseña'}
                                </Button>
                            </form>
                        )}

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            <Link
                                to="/auth/login"
                                className="underline underline-offset-4"
                            >
                                Volver a iniciar sesión
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
