const lps = new Intl.NumberFormat('es-HN', { maximumFractionDigits: 0 });

/** Formatea un monto en Lempiras: `1200` → `L. 1,200`. */
export const formatLps = (amount: number): string =>
  `L. ${lps.format(Math.round(amount))}`;

/** Duración legible: `135` → `2 h 15 min`. */
export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  return `${m} min`;
};
