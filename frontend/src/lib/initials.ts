/** Iniciales de un nombre: "Kelin Rodríguez" → "KR", "Kelin" → "KE". */
export const initials = (name: string): string => {
  const parts = name
    .replace(/\(.*?\)/g, '') // quita "(Admin)" y similares
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
