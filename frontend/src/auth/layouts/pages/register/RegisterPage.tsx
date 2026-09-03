import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';

import { apiErrorMessage } from '@/api/errors';
import { CustomLogo } from '@/components/Custom/CustomLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/auth/context/use-auth';

export const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: register,
        onSuccess: () => navigate('/', { replace: true }),
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const phone = String(form.get('phone') ?? '').trim();
        mutation.mutate({
            fullName: String(form.get('fullName') ?? ''),
            email: String(form.get('email') ?? ''),
            password: String(form.get('password') ?? ''),
            ...(phone ? { phone } : {}),
        });
    };

    return (
        <div className={'flex flex-col gap-6'}>
            <Card className="overflow-hidden p-0  ">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <CustomLogo />

                                <p className="text-balance text-muted-foreground">
                                    Crea una nueva cuenta
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">Nombre completo</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="Nombre completo"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="mail@google.com"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono (opcional)</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="+1 809 000 0000"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="Contraseña"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Mínimo 6 caracteres, con una mayúscula, una
                                    minúscula y un número.
                                </p>
                            </div>

                            {mutation.isError && (
                                <p className="text-sm text-destructive">
                                    {apiErrorMessage(
                                        mutation.error,
                                        'No se pudo crear la cuenta.',
                                    )}
                                </p>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
                            </Button>

                            <div className="text-center text-sm">
                                ¿Ya tienes cuenta?{' '}
                                <Link to="/auth/login" className="underline underline-offset-4">
                                    Ingresa ahora
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
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                Haciendo click, estás de acuerdo con{' '}
                <a href="#">términos y condiciones</a> y{' '}
                <a href="#">políticas de uso</a>.
            </div>
        </div>
    );
};
