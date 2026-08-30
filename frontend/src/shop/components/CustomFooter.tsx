
export const CustomFooter = () => {
    return (
        <footer className="border-t py-12 px-4 lg:px-8 mt-16">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-semibold mb-4">LUNE BY KELIN</h3>
                        <p className="text-sm text-muted-foreground">
                            Estudio profesional de manicura, aplicacion de uñas esculpidas, nall art de tendencia y cuidado de manos.
                            Diseñamos con pasion y precision para resaltar tu estilo unico
                        </p>
                    </div>

                    <div>
                        <h4 className="font-medium mb-4">Servicios populares</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground">Uñas acrilicas</a></li>
                            <li><a href="#" className="hover:text-foreground">Manicura rusa y en gel</a></li>
                            <li><a href="#" className="hover:text-foreground">Diseños Nail Art</a></li>
                            <li><a href="#" className="hover:text-foreground">Baño de acrilico & retiro seguro</a></li>
                            <li><a href="#" className="hover:text-foreground">Spa de manos hidratante</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-medium mb-4">Horario de atencion</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground">Lunes a Viernes: 5:30 PM - 10:00 PM</a></li>
                            <li><a href="#" className="hover:text-foreground">Sabados: 5:30 PM - 10:00 PM</a></li>
                            <li><a href="#" className="hover:text-foreground">Domingos: Previa a cita especial</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-medium mb-4">Ubicacion</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground">Estudio LuneBy, Choloma, Cortés, Honduras</a></li>
                            <li><a href="#" className="hover:text-foreground">Consultas directas: +504 2525-2525</a></li>

                        </ul>
                    </div>
                </div>

                <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Luné by Kelin. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
};