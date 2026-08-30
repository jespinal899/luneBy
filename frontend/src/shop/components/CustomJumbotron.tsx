interface Props {
    title: string;
    subtitle?: string;
}



export const CustomJumbotron = ({ title, subtitle }: Props) => {


    const defaultSubtitle = 'Bienvenida a LuneBy Kelin. Especialista en manicura , uñas acrilicas esculpidas y nail art de autor. Cotiza tu diseño favorito en tiempo real y agenda tu cita en segundos.';



    return (
        <section className="py-10 px-4 lg:px-8 bg-muted/30">
            <div className="container mx-auto text-center">
                <h1 className=" font-montserrat text-5xl lg:text-7xl  tracking-tight mb-6">
                    {title}
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    {subtitle || defaultSubtitle}
                </p>




            </div>
        </section>
    )
}