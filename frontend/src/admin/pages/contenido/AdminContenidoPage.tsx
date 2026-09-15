import { useState } from 'react';
import { SaveAll, Upload, X } from 'lucide-react';

import { AdminTitle } from '@/admin/components/AdminTitle';
import { ImageCropper } from '@/admin/components/ImageCropper';
import { useUpdateHero } from '@/admin/hooks/use-hero-admin';
import { useUploadImage } from '@/admin/hooks/use-upload-image';
import { apiErrorMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { formInputClass as inputClass } from '@/lib/form-styles';
import type { Hero } from '@/shop/api/site-content.actions';
import { defaultHeroImage, useHero } from '@/shop/hooks/use-hero';

/** La portada se muestra en 4:5; se recorta igual para que no haya sorpresas. */
const HERO_ASPECT = 4 / 5;

/**
 * Edición de la portada del sitio: los textos y la foto que ve una clienta al
 * entrar. Antes esto vivía escrito en el código y cambiarlo exigía un
 * despliegue.
 */
export const AdminContenidoPage = () => {
  const { hero } = useHero();
  const mutation = useUpdateHero();
  const upload = useUploadImage();

  const [form, setForm] = useState<Hero | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);

  // Mientras no se haya tocado nada se muestra lo guardado; apenas la
  // administradora escribe, manda el formulario. Así no hace falta esperar a
  // que llegue la portada para que el campo responda.
  const value = form ?? hero;

  const set = <K extends keyof Hero>(field: K, fieldValue: Hero[K]) => {
    setSaved(false);
    setForm({ ...value, [field]: fieldValue });
  };

  // Igual que en el catálogo: la foto pasa primero por el recorte, para que
  // sea Kelin quien decida qué parte se ve y no el `object-cover`.
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    // Permite volver a elegir la misma foto si cancela el recorte.
    event.target.value = '';
  };

  const handleCropConfirm = (cropped: File) => {
    upload.mutate(cropped, {
      onSuccess: (url) => {
        set('image', url);
        setPendingFile(null);
      },
      onError: () => setPendingFile(null),
    });
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(value, { onSuccess: () => setSaved(true) });
  };

  return (
    <>
      {pendingFile && (
        <ImageCropper
          file={pendingFile}
          aspect={HERO_ASPECT}
          onConfirm={handleCropConfirm}
          onCancel={() => setPendingFile(null)}
          isUploading={upload.isPending}
        />
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between">
          <AdminTitle
            title="Portada"
            subtitle="Lo primero que ve una clienta al entrar al sitio. Los cambios se publican al guardar."
          />
          <div className="mb-10 flex justify-end gap-4">
            <Button type="submit" disabled={mutation.isPending}>
              <SaveAll className="h-4 w-4" />
              {mutation.isPending ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </div>

        {mutation.isError && (
          <p className="mb-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {apiErrorMessage(mutation.error, 'No se pudo guardar la portada.')}
          </p>
        )}

        {saved && !mutation.isPending && (
          <p className="mb-6 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
            Portada actualizada. Ya se ve en el sitio.
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-foreground">
                Textos de la portada
              </h2>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="portada-eyebrow"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Línea pequeña
                  </label>
                  <input
                    id="portada-eyebrow"
                    type="text"
                    required
                    minLength={2}
                    maxLength={60}
                    value={value.eyebrow}
                    onChange={(e) => set('eyebrow', e.target.value)}
                    className={inputClass}
                    placeholder="Ej: Estudio de uñas · Choloma"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    El texto chiquito que va arriba del título.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="portada-titulo"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Título
                  </label>
                  <input
                    id="portada-titulo"
                    type="text"
                    required
                    minLength={2}
                    maxLength={90}
                    value={value.title}
                    onChange={(e) => set('title', e.target.value)}
                    className={inputClass}
                    placeholder="Ej: Tus uñas, tu mejor accesorio de lujo"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Se ve muy grande. Cuanto más corto, mejor se lee en el
                    teléfono.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="portada-subtitulo"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Texto
                  </label>
                  <textarea
                    id="portada-subtitulo"
                    required
                    minLength={2}
                    maxLength={300}
                    rows={4}
                    value={value.subtitle}
                    onChange={(e) => set('subtitle', e.target.value)}
                    className={`${inputClass} resize-none`}
                    placeholder="Contá en una o dos frases qué hacés y por qué agendar."
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {value.subtitle.length} de 300 caracteres.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Foto de la portada
              </h2>

              {value.image ? (
                <div className="relative">
                  <img
                    src={value.image}
                    alt="Vista previa de la portada"
                    className="aspect-[4/5] w-full rounded-lg border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => set('image', null)}
                    aria-label="Quitar la foto"
                    className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <img
                    src={defaultHeroImage}
                    alt="Foto que trae el sitio por defecto"
                    className="mb-4 aspect-[4/5] w-full rounded-lg border border-border object-cover opacity-60"
                  />
                  <label className="relative block cursor-pointer rounded-lg border-2 border-dashed border-input p-6 text-center transition-colors hover:border-input">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      disabled={upload.isPending}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {upload.isPending ? 'Subiendo…' : 'Cambiar la foto'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG o WEBP · hasta 5 MB · vas a poder recortarla
                    </p>
                  </label>
                </>
              )}

              {upload.isError && (
                <p className="mt-2 text-xs text-destructive">
                  {apiErrorMessage(upload.error, 'No se pudo subir la imagen.')}
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Si quitás la foto vuelve la que trae el sitio. La imagen se
                muestra vertical: se recorta a esa forma antes de subirla.
              </p>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};
