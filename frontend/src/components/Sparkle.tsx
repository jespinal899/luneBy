interface Props {
  className?: string;
}

/** Estrella de cuatro puntas para los acentos decorativos del sitio. */
export const Sparkle = ({ className }: Props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12 0c.7 6.1 5.2 10.6 11.3 11.3v.1C17.2 12.2 12.7 16.7 12 22.8h-.1C11.2 16.7 6.7 12.2.6 11.5v-.1C6.7 10.6 11.2 6.1 11.9 0Z" />
  </svg>
);
