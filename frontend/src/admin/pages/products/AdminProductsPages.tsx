import { AdminTitle } from '@/admin/components/AdminTitle';
import { CustomPagination } from '@/components/Custom/CustomPagination';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import { PlusIcon, Pencil } from 'lucide-react';
import { Link } from 'react-router';
import { products } from '@/mocks/products.mock';

const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h ? `${h}h${m ? ` ${m}min` : ''}` : `${m} min`;
};

export const AdminProductsPage = () => {
    return (
        <>
            <div className="flex items-center justify-between">
                <AdminTitle
                    title="Servicios"
                    subtitle="Administra los servicios de uñas que tus clientas pueden agendar."
                />

                <div className="mb-10 flex justify-end gap-4">
                    <Button render={<Link to="/admin/products/new" />}>
                        <PlusIcon />
                        Nuevo servicio
                    </Button>
                </div>
            </div>

            <Table className="mb-10 border border-gray-200 bg-white p-10 shadow-xs">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Imagen</TableHead>
                        <TableHead>Servicio</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((service) => (
                        <TableRow key={service.id}>
                            <TableCell className="font-medium">{service.id}</TableCell>
                            <TableCell>
                                <img
                                    src={service.image}
                                    alt={service.name}
                                    className="h-16 w-16 rounded-md object-cover"
                                />
                            </TableCell>
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                    {service.category}
                                </span>
                            </TableCell>
                            <TableCell>{formatDuration(service.durationMin)}</TableCell>
                            <TableCell>${service.price.toFixed(2)}</TableCell>
                            <TableCell>
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                        service.isActive
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            service.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                        }`}
                                    />
                                    {service.isActive ? 'Disponible' : 'Oculto'}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    render={<Link to={`/admin/products/${service.id}`} />}
                                >
                                    <Pencil className="h-4 w-4" />
                                    Editar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <CustomPagination totalPages={3} />
        </>
    );
};
