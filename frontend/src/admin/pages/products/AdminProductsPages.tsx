import { Pencil, PlusIcon, Trash2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { AdminTitle } from '@/admin/components/AdminTitle';
import {
    useAdminCatalog,
    useDeleteCatalogItem,
} from '@/admin/hooks/use-catalog-admin';
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
import { formatLps } from '@/shop/lib/format';
import { serviceImage } from '@/shop/lib/service-image';

const PAGE_SIZE = 10;

/**
 * Catálogo: los diseños que se ven en /shop y en #servicios. Cada entrada
 * apunta a un servicio agendable (de ahí saca nombre, precio y duración) y
 * aporta su propia foto y descripción.
 */
export const AdminProductsPage = () => {
    const [params] = useSearchParams();
    const page = Math.max(1, Number(params.get('page')) || 1);

    const { data, isLoading, isError } = useAdminCatalog({
        page,
        limit: PAGE_SIZE,
    });
    const deleteItem = useDeleteCatalogItem();

    const handleDelete = (id: string, name: string) => {
        if (!window.confirm(`¿Eliminar este diseño de "${name}" del catálogo?`))
            return;
        deleteItem.mutate(id, {
            onError: () => window.alert('No se pudo eliminar el diseño.'),
        });
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <AdminTitle
                    title="Catálogo"
                    subtitle="Los diseños que ven tus clientas en la página de servicios. Cada uno apunta a un servicio agendable y hereda su nombre, precio y duración."
                />

                <div className="mb-10 flex justify-end gap-4">
                    <Button render={<Link to="/admin/products/new" />}>
                        <PlusIcon />
                        Nuevo diseño
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <p className="py-16 text-center text-muted-foreground">Cargando catálogo…</p>
            ) : isError ? (
                <p className="py-16 text-center text-destructive">
                    No se pudo cargar el catálogo.
                </p>
            ) : data?.products.length === 0 ? (
                <p className="py-16 text-center text-muted-foreground">
                    Todavía no hay diseños en el catálogo. Creá el primero con
                    “Nuevo diseño”.
                </p>
            ) : (
                <>
                    <Table className="mb-10 border border-border bg-card shadow-xs">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Foto</TableHead>
                                <TableHead>Servicio</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.products.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <img
                                            src={serviceImage(item.image, item.category)}
                                            alt={item.name}
                                            className="h-16 w-16 rounded-md object-cover"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {item.name}
                                    </TableCell>
                                    <TableCell>
                                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                                            {item.category}
                                        </span>
                                    </TableCell>
                                    <TableCell>{formatLps(item.price)}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                                item.isActive
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    item.isActive
                                                        ? 'bg-success'
                                                        : 'bg-muted-foreground'
                                                }`}
                                            />
                                            {item.isActive ? 'Visible' : 'Oculto'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            render={
                                                <Link to={`/admin/products/${item.id}`} />
                                            }
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            disabled={deleteItem.isPending}
                                            onClick={() =>
                                                handleDelete(item.id, item.name)
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
