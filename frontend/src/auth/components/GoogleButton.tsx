import { useEffect, useRef, useState } from 'react';

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

let scriptPromise: Promise<void> | null = null;

const loadGis = () => {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SRC}"]`,
    );
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google'));
    document.head.appendChild(script);
  });
  return scriptPromise;
};

interface Props {
  /** Recibe el ID token de Google. */
  onCredential: (idToken: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

/** Botón "Continuar con Google" (Google Identity Services). */
export const GoogleButton = ({ onCredential, text = 'continue_with' }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(!CLIENT_ID);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGis()
      .then(() => {
        if (cancelled || !window.google || !containerRef.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          ux_mode: 'popup',
          callback: (res) => onCredential(res.credential),
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          width: 320,
          locale: 'es',
        });
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [onCredential, text]);

  if (failed) return null;

  return <div ref={containerRef} className="flex justify-center" />;
};
