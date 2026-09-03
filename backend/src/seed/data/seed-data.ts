import * as bcrypt from 'bcrypt';

interface SeedUser {
  email: string;
  fullName: string;
  password: string;
  phone?: string;
  roles: string[];
}

interface SeedService {
  name: string;
  price: number;
  description: string;
  category: string;
  durationMin: number;
  isActive: boolean;
}

interface SeedAvailabilityRule {
  weekday: number;
  startTime: string;
  endTime: string;
  slotIntervalMin: number;
}

interface SeedData {
  users: SeedUser[];
  services: SeedService[];
  availabilityRules: SeedAvailabilityRule[];
}

export const initialData: SeedData = {
  users: [
    {
      email: 'kelin@luneby.com',
      fullName: 'Kelin (Admin)',
      password: bcrypt.hashSync('Abc123', 10),
      roles: ['admin'],
    },
    {
      email: 'cliente@test.com',
      fullName: 'Clienta de Prueba',
      password: bcrypt.hashSync('Abc123', 10),
      phone: '+18090000000',
      roles: ['client'],
    },
  ],

  // Lunes a sábado, 09:00–18:00, slots cada 30 min (domingo cerrado).
  availabilityRules: [1, 2, 3, 4, 5, 6].map((weekday) => ({
    weekday,
    startTime: '09:00',
    endTime: '18:00',
    slotIntervalMin: 30,
  })),

  services: [
    {
      name: 'Manicura Rusa Premium',
      price: 35,
      category: 'Manicura',
      description:
        'Técnica de precisión milimétrica que limpia profundamente la cutícula para permitir un esmaltado debajo del pliegue ungueal con duración de 3 semanas.',
      durationMin: 75,
      isActive: true,
    },
    {
      name: 'Uñas Acrílicas Esculpidas',
      price: 65,
      category: 'Acrilico',
      description:
        'Extensión y modelado de uñas acrílicas a mano alzada para un acabado natural, resistente y elegante.',
      durationMin: 120,
      isActive: true,
    },
    {
      name: 'Diseño Nail Art de Autor',
      price: 45,
      category: 'Nail Art',
      description:
        'Diseños creativos personalizados y pintados a mano alzada por nuestras artistas especialistas.',
      durationMin: 90,
      isActive: true,
    },
    {
      name: 'Esmaltado Semipermanente',
      price: 25,
      category: 'Semipermanente',
      description:
        'Esmaltado de larga duración con brillo extremo, curado bajo cabina LED para uñas impecables.',
      durationMin: 45,
      isActive: true,
    },
    {
      name: 'Pedicura Spa Relajante',
      price: 50,
      category: 'Pedicura',
      description:
        'Tratamiento completo para pies que incluye exfoliación profunda, masaje de hidratación y esmaltado.',
      durationMin: 60,
      isActive: true,
    },
    {
      name: 'Baño de Acrílico (Kapping)',
      price: 40,
      category: 'Acrilico',
      description:
        'Capa de acrílico protectora sobre tu uña natural para fortalecerla y evitar rupturas.',
      durationMin: 80,
      isActive: true,
    },
    {
      name: 'Retiro Seguro + Cuidado',
      price: 15,
      category: 'Manicura',
      description:
        'Retiro cuidadoso de sistemas sin dañar tu uña natural, finalizando con aceite nutritivo.',
      durationMin: 30,
      isActive: true,
    },
    {
      name: 'Nail Art Encapsulado 3D',
      price: 55,
      category: 'Nail Art',
      description:
        'Diseño premium encapsulado con flores secas, glitters o relieve en 3D para una manicura de impacto.',
      durationMin: 110,
      isActive: false,
    },
  ],
};
