import serviceAcrylic from "@/assets/service-acrylic.jpg";
import serviceGel from "@/assets/service-gel.jpg";
import serviceNailart from "@/assets/service-nailart.jpg";

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    description: string;
}

export const products: Product[] = [
    {
        id: "1",
        name: "Manicura Rusa Premium",
        price: 35,
        image: serviceGel,
        category: "Manicura",
        description: "Técnica de precisión milimétrica que limpia profundamente la cutícula para permitir un esmaltado debajo del pliegue ungueal con duración de 3 semanas."
    },
    {
        id: "2",
        name: "Uñas Acrílicas Esculpidas",
        price: 65,
        image: serviceAcrylic,
        category: "Acrilico",
        description: "Extensión y modelado de uñas acrílicas a mano alzada para un acabado natural, resistente y elegante."
    },
    {
        id: "3",
        name: "Diseño Nail Art de Autor",
        price: 45,
        image: serviceNailart,
        category: "Nail Art",
        description: "Diseños creativos personalizados y pintados a mano alzada por nuestras artistas especialistas."
    },
    {
        id: "4",
        name: "Esmaltado Semipermanente",
        price: 25,
        image: serviceGel,
        category: "Semipermanente",
        description: "Esmaltado de larga duración con brillo extremo, curado bajo cabina LED para uñas impecables."
    },
    {
        id: "5",
        name: "Pedicura Spa Relajante",
        price: 50,
        image: serviceAcrylic,
        category: "Pedicura",
        description: "Tratamiento completo para pies que incluye exfoliación profunda, masaje de hidratación y esmaltado."
    },
    {
        id: "6",
        name: "Baño de Acrílico (Kapping)",
        price: 40,
        image: serviceAcrylic,
        category: "Acrilico",
        description: "Capa de acrílico protectora sobre tu uña natural para fortalecerla y evitar rupturas."
    },
    {
        id: "7",
        name: "Retiro Seguro + Cuidado",
        price: 15,
        image: serviceGel,
        category: "Manicura",
        description: "Retiro cuidadoso de sistemas sin dañar tu uña natural, finalizando con aceite nutritivo."
    },
    {
        id: "8",
        name: "Nail Art Encapsulado 3D",
        price: 55,
        image: serviceNailart,
        category: "Nail Art",
        description: "Diseño premium encapsulado con flores secas, glitters o relieve en 3D para una manicura de impacto."
    }
];