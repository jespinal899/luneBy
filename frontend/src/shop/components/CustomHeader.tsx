import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, type KeyboardEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { cn } from "@/lib/utils";



export const CustomHeader = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const { shop } = useParams();

    const inputRef = useRef<HTMLInputElement>(null);
    const query = searchParams.get('query') || '';





    const handleSearch = (event: KeyboardEvent<HTMLInputElement>) => {

        if (event.key !== 'Enter') return;

        const query = inputRef.current?.value || '';


        const newSearchParams = new URLSearchParams()


        if (!query) {
            newSearchParams.delete('query');

        } else {
            newSearchParams.set('query', inputRef.current!.value);
        }



        setSearchParams(newSearchParams)
    }



    return <header className="sticky top-0 z-50 w-full border-b backdrop-blur bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
            <div className="flex h-16 items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-semibold tracking-tight">LUNE BY KELIN</h1>
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
                    <Link to="/shop/contacto" className={cn(`text-sm font-medium transition-colors hover:text-primary`,
                        shop == 'contacto' ? 'underline underline-offset-4' : ''
                    )}
                    >
                        Contacto
                    </Link>
                </nav>

                {/* Search and Cart */}
                <div className="flex items-center space-x-4">
                    <div className="hidden md:flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={inputRef}
                                placeholder="Buscar productos..." className="pl-9 w-64  h-9 bg-white"
                                onKeyDown={handleSearch}
                                defaultValue={query}

                            />
                        </div>
                    </div>

                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Search className="h-5 w-5" />
                    </Button>


                    <Link to="/auth/login">
                        <Button
                            variant="default"
                            size="sm"
                            className="ml-2"
                        >
                            Login
                        </Button>
                    </Link>


                    <Link to="/admin">
                        <Button
                            variant="destructive"
                            size="sm"
                            className="ml-2"
                        >
                            Admin
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    </header >;
};
export default CustomHeader;