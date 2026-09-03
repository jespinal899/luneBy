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

export interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  notes: string | null;
  service: Service;
  user: User;
  createdAt: string;
}
