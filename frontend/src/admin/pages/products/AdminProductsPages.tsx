import { Pencil, PlusIcon, Trash2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { AdminTitle } from '@/admin/components/AdminTitle';
import { useDeleteService } from '@/admin/hooks/use-service-mutations';
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
import { useServices } from '@/shop/hooks/use-services';
import { serviceImage } from '@/shop/lib/service-image';

const PAGE_SIZE = 10;

const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h ? `${h}h${m ? ` ${m}min` : ''}` : `${m} min`;
};

export const AdminProductsPage = () => {
    const [params] = useSearchParams();
    const page = Math.max(1, Number(params.get('page')) || 1);

    const { data, isLoading, isError } = useServices({ page, limit: PAGE_SIZE });
    const deleteService = useDeleteService();

    const handleDelete = (id: string, name: string) => {
        if (!window.confirm(`¿Eliminar el servicio "${name}"?`)) return;
        deleteService.mutate(id, {
            onError: () =>
                window.alert(
                    'No se pudo eliminar. Puede tener citas asociadas; ' +
                        'márcalo como oculto en su lugar.',
                ),
        });
    };

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

            {isLoading ? (
                <p className="py-16 text-center text-slate-500">Cargando servicios…</p>
            ) : isError ? (
                <p className="py-16 text-center text-red-600">
                    No se pudieron cargar los servicios.
                </p>
            ) : (
                <>
                    <Table className="mb-10 border border-gray-200 bg-white p-10 shadow-xs">
                        <TableHeader>
                            <TableRow>
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
                            {data?.products.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell>
                                        <img
                                            src={serviceImage(service.image, service.category)}
                                            alt={service.name}
                                            className="h-16 w-16 rounded-md object-cover"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {service.name}
                                    </TableCell>
                                    <TableCell>
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                            {service.category}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {formatDuration(service.durationMin)}
                                    </TableCell>
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
                                                    service.isActive
                                                        ? 'bg-emerald-500'
                                                        : 'bg-slate-400'
                                                }`}
                                            />
                                            {service.isActive ? 'Disponible' : 'Oculto'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            render={
                                                <Link to={`/admin/products/${service.id}`} />
                                            }
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            disabled={deleteService.isPending}
                                            onClick={() =>
                                                handleDelete(service.id, service.name)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {data && data.pages > 1 && (
                        <CustomPagination totalPages={data.pages} />
                    )}
                </>
            )}
        </>
    );
};
