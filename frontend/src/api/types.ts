// Tipos compartidos con la API del backend (Luné by Kelin).

export type Role = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  /** Foto de perfil de Google, si inició sesión con Google. */
  avatarUrl?: string | null;
  /** `false` si la cuenta solo inicia sesión con Google (no tiene contraseña local). */
  hasPassword?: boolean;
  isActive: boolean;
  roles: Role[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: string;
  /** Duración estimada del servicio en minutos. */
  durationMin: number;
  image: string | null;
  slug: string;
  /** Disponible para agendar en /shop/agendar. */
  isActive: boolean;
}

/**
 * Una entrada del catálogo (/shop y #servicios): la foto de un diseño con
 * los datos del servicio agendable al que corresponde ya mezclados — el
 * backend los aplana, acá no hay que ir a buscarlos por separado.
 */
export interface CatalogItem {
  /** Id de la entrada del catálogo (no del servicio). */
  id: string;
  /** Servicio agendable al que corresponde. */
  serviceId: string;
  name: string;
  price: number;
  durationMin: number;
  category: string;
  slug: string;
  image: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

/** Respuesta paginada de GET /catalog (la lista va bajo `products`). */
export interface CatalogPage {
  count: number;
  page: number;
  pages: number;
  products: CatalogItem[];
}

/** Respuesta paginada de GET /services (el listado va bajo `products`). */
export interface ServicesPage {
  count: number;
  page: number;
  pages: number;
  products: Service[];
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'done';

/** Línea de la cotización congelada de una cita: un servicio elegido. */
export interface AppointmentItem {
  id: string;
  nameAtBooking: string;
  priceAtBooking: number;
  service: Service | null;
}

export interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  notes: string | null;
  /** Precio total congelado al reservar (suma de servicios; puede faltar en citas antiguas). */
  priceAtBooking: number | null;
  /** Duración total en minutos. */
  durationMin?: number;
  service: Service;
  /** Servicios elegidos para la cita (puede faltar en citas antiguas). */
  items?: AppointmentItem[];
  user: User;
  createdAt: string;
}

/** Un día del horario semanal de atención. */
export interface WeeklyScheduleDay {
  weekday: number; // 0 = domingo ... 6 = sábado
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isActive: boolean;
}
