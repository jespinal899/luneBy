import { Link } from 'react-router';

export const CustomLogo = () => {
    return (
        <Link to="/" className="flex items-center whitespace-nowrap">
            <span className="font-montserrat font-bold text-xl m-0 whitespace-nowrap">
                Lune By Kelin |
            </span>
            <p className="text-muted-foreground m-0 px-2 whitespace-nowrap">
                Agenda tu cita
            </p>
        </Link>
    );
};
