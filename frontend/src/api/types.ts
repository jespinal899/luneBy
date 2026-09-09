// Tipos compartidos con la API del backend (Luné by Kelin).

export type Role = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
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
  isActive: boolean;
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
