import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router';

import { apiErrorMessage } from '@/api/errors';
import { GoogleButton } from '@/auth/components/GoogleButton';
import { CustomLogo } from '@/components/Custom/CustomLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/auth/context/use-auth';

export const LoginPage = () => {
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: string } | null)?.from ?? '/';

    const mutation = useMutation({
        mutationFn: login,
        onSuccess: () => navigate(from, { replace: true }),
    });

    const googleMutation = useMutation({
        mutationFn: loginWithGoogle,
        onSuccess: () => navigate(from, { replace: true }),
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        mutation.mutate({
            email: String(form.get('email') ?? ''),
            password: String(form.get('password') ?? ''),
        });
    };

    return (
        <div className={'flex flex-col gap-6'}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <CustomLogo />

                                <p className="text-balance text-muted-foreground">
                                    Ingresa a tu cuenta
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <a
                                        href="#"
                                        className="ml-auto text-sm underline-offset-4 hover:underline"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                />
                            </div>

                            {mutation.isError && (
                                <p className="text-sm text-destructive">
                                    {apiErrorMessage(
                                        mutation.error,
                                        'No se pudo iniciar sesión.',
                                    )}
                                </p>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending ? 'Ingresando…' : 'Ingresar'}
                            </Button>
                            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                    O ingresa con
                                </span>
                            </div>
                            <GoogleButton
                                text="signin_with"
                                onCredential={(t) => googleMutation.mutate(t)}
                            />
                            {googleMutation.isError && (
                                <p className="text-center text-sm text-destructive">
                                    {apiErrorMessage(
                                        googleMutation.error,
                                        'No se pudo iniciar sesión con Google.',
                                    )}
                                </p>
                            )}
                            <div className="text-center text-sm">
                                ¿No tienes cuenta?{' '}
                                <Link
                                    to="/auth/register"
                                    className="underline underline-offset-4"
                                >
                                    Regístrate
                                </Link>
                            </div>
                        </div>
                    </form>
                    <div className="relative hidden bg-muted md:block">
                        <img
                            src="/placeholder.svg"
                            alt="Image"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
