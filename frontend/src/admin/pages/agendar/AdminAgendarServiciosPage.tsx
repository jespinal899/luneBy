import { Pencil, PlusIcon, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import { AdminTitle } from '@/admin/components/AdminTitle';
import { useAdminServices } from '@/admin/hooks/use-admin-services';
import { useDeleteService } from '@/admin/hooks/use-service-mutations';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import { formatDuration, formatLps } from '@/shop/lib/format';

/**
 * Servicios agendables: lo que la clienta puede reservar en /shop/agendar.
 * El catálogo de diseños (las fotos) se administra aparte, en /admin/products.
 */
export const AdminAgendarServiciosPage = () => {
    const { data, isLoading, isError } = useAdminServices({ limit: 100 });
    const deleteService = useDeleteService();

    const handleDelete = (id: string, name: string) => {
        if (!window.confirm(`¿Eliminar el servicio "${name}"?`)) return;
        deleteService.mutate(id, {
            onError: () =>
                window.alert(
                    'No se pudo eliminar. Puede tener citas asociadas; ' +
                        'márcalo como no disponible en su lugar.',
                ),
        });
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <AdminTitle
                    title="Agendar"
                    subtitle="Los servicios que tus clientas pueden reservar en la página de agendar. Aquí defines nombre, precio y duración."
                />

                <div className="mb-10 flex justify-end gap-4">
                    <Button render={<Link to="/admin/agendar/new" />}>
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
            ) : data && data.products.length === 0 ? (
                <p className="py-16 text-center text-slate-500">
                    Todavía no hay servicios. Creá el primero con “Nuevo servicio”.
                </p>
            ) : (
                <Table className="mb-10 border border-gray-200 bg-white shadow-xs">
                    <TableHeader>
                        <TableRow>
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
                                <TableCell>{formatLps(service.price)}</TableCell>
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
                                        {service.isActive
                                            ? 'Agendable'
                                            : 'No disponible'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        render={
                                            <Link to={`/admin/agendar/${service.id}`} />
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
            )}
        </>
    );
};
