interface Props {
  count?: number;
}

/** Placeholder animado del catálogo mientras carga `/services`. */
export const ProductsGridSkeleton = ({ count = 6 }: Props) => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="aspect-square w-full rounded-lg bg-muted" />
        <div className="space-y-2 px-4 pt-6">
          <div className="h-3.5 w-3/4 rounded bg-muted" />
          <div className="h-2.5 w-1/3 rounded bg-muted" />
          <div className="h-5 w-1/4 rounded bg-muted" />
        </div>
      </div>
    ))}
  </div>
);
