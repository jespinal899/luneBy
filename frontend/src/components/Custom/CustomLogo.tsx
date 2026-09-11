import { Link } from 'react-router';
import logoby from '@/assets/logoby.webp';
import { cn } from '@/lib/utils';

interface Props {
    /** Clases para controlar el tamaño del logo, ej: "h-16", "max-h-10 w-auto" */
    className?: string;
}

export const CustomLogo = ({ className }: Props) => {
    return (
        <Link to="/" className="flex items-center whitespace-nowrap">
            <img
                src={logoby}
                alt="Logo"
                width={480}
                height={240}
                fetchPriority="high"
                className={cn(
                    'w-auto max-w-full object-contain',
                    className ?? 'h-16',
                )}
            />
        </Link>
    );
};
