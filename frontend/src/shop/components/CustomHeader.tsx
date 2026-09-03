import { LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, type KeyboardEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { cn } from "@/lib/utils";
import { CustomLogo } from "@/components/Custom/CustomLogo";
import { useAuth } from "@/auth/context/use-auth";



export const CustomHeader = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const { shop } = useParams();
    const navigate = useNavigate();
    const { status, user, isAdmin, logout } = useAuth();

    const inputRef = useRef<HTMLInputElement>(null);
    const query = searchParams.get('query') || '';

    const handleSearch = (event: KeyboardEvent<HTMLInputElement>) => {

        if (event.key !== 'Enter') return;

        const value = inputRef.current?.value || '';

        const newSearchParams = new URLSearchParams()

        if (value) newSearchParams.set('query', value);

        setSearchParams(newSearchParams)
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };



    return <header className="sticky top-0 z-50 w-full border-b backdrop-blur bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
            <div className="flex h-16 items-center justify-between">
                {/* Logo */}
                <div className="flex h-full shrink-0 items-center ml-4">
                    <CustomLogo className="max-h-15" />
                </div>


                {/* Navigation - Desktop */}
                <nav className="hidden md:flex items-center space-x-8">
                    <Link to="/"

                        className={cn(`text-sm font-medium transition-colors hover:text-primary`,
                            !shop ? 'underline underline-offset-4' : ''
                        )}
                    >
                        Inicio
                    </Link>
                    <Link to="/shop/servicios"

                        className={cn(`text-sm font-medium transition-colors hover:text-primary`,
                            shop == 'servicios' ? 'underline underline-offset-4' : ''
                        )}
                    >
                        Servicios
                    </Link>
                    <Link to="/shop/agendar" className={cn(`text-sm font-medium transition-colors hover:text-primary`,
                        shop == 'agendar' ? 'underline underline-offset-4' : ''
                    )}
                    >
                        Agendar
                    </Link>
                    {status === 'authenticated' && (
                        <Link to="/mis-citas" className={cn(`text-sm font-medium transition-colors hover:text-primary`,
                            shop == 'mis-citas' ? 'underline underline-offset-4' : ''
                        )}
                        >
                            Mis citas
                        </Link>
                    )}
                    <Link to="/shop/contacto" className={cn(`text-sm font-medium transition-colors hover:text-primary`,
                        shop == 'contacto' ? 'underline underline-offset-4' : ''
                    )}
                    >
                        Contacto
                    </Link>
                </nav>

                {/* Search and Auth */}
                <div className="flex items-center space-x-4">
                    <div className="hidden md:flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={inputRef}
                                placeholder="Buscar servicios..." className="pl-9 w-64  h-9 bg-white"
                                onKeyDown={handleSearch}
                                defaultValue={query}

                            />
                        </div>
                    </div>

                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Search className="h-5 w-5" />
                    </Button>

                    {status === 'authenticated' ? (
                        <div className="ml-2 flex items-center gap-2">
                            <span className="hidden text-sm font-medium text-slate-600 sm:inline">
                                {user?.fullName}
                            </span>
                            {isAdmin && (
                                <Button
                                    render={<Link to="/admin" />}
                                    variant="destructive"
                                    size="sm"
                                >
                                    Admin
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                <LogOut className="h-4 w-4" />
                                Salir
                            </Button>
                        </div>
                    ) : (
                        <Button
                            render={<Link to="/auth/login" />}
                            variant="default"
                            size="sm"
                            className="ml-2"
                        >
                            Ingresar
                        </Button>
                    )}
                </div>
            </div>
        </div>
    </header >;
};
export default CustomHeader;
