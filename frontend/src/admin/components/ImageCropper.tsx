import { useCallback, useEffect, useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import { Loader2, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cropToFile, type CropArea } from "@/lib/crop-image";

interface Props {
  /** Archivo que eligió la administradora, todavía sin subir. */
  file: File;
  /** Recibe la imagen ya recortada, lista para subir. */
  onConfirm: (cropped: File) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

/**
 * Recorte de la foto antes de subirla.
 *
 * El catálogo muestra las fotos en `object-cover`, así que el navegador las
 * recorta igual: sin este paso, qué parte del diseño queda visible lo decide
 * el navegador y no Kelin. Se recorta a 1:1 porque esa es la proporción de la
 * página de detalle, donde la foto se ve grande.
 */
export const ImageCropper = ({
  file,
  onConfirm,
  onCancel,
  isUploading = false,
}: Props) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<CropArea | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  // Se deriva en el render (no en un efecto) para que el recorte aparezca
  // ya con la foto en el primer pintado; el efecto solo libera el recurso.
  const src = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(src), [src]);

  const onCropComplete = useCallback((_: CropArea, pixels: CropArea) => {
    setArea(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!area) return;
    setWorking(true);
    setError(null);
    try {
      onConfirm(await cropToFile(src, area, file.name));
    } catch {
      setError("No se pudo recortar la imagen. Probá con otra foto.");
      setWorking(false);
    }
  };

  const busy = working || isUploading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Recortar la foto"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            Ajustá la foto
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Arrastrá para elegir qué parte del diseño se ve. Lo que quede dentro
            del cuadro es lo que verán tus clientas.
          </p>
        </div>

        <div className="relative h-72 bg-muted sm:h-80">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-3 px-5 py-4">
          <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            id="zoom-recorte"
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Acercar o alejar"
            className="h-1.5 w-full cursor-pointer accent-primary"
          />
        </div>

        {error && <p className="px-5 pb-2 text-xs text-destructive">{error}</p>}

        <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? "Subiendo…" : "Recortar y subir"}
          </Button>
        </div>
      </div>
    </div>
  );
};
