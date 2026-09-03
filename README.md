# 💅 Luné by Kelin - Plataforma de Servicios y Citas de Manicura

> **Código de Verificación:** `LEARN-CAP-F997E70D`  
> **Repositorio de GitHub:** [https://github.com/jespinal899/luneBy](https://github.com/jespinal899/luneBy)

---

## 🌟 Descripción del Proyecto
**Luné by Kelin** es una aplicación web moderna y premium diseñada para un estudio profesional de manicura, aplicación de uñas esculpidas, nail art de tendencia y cuidado de manos. Permite a las clientes navegar por el catálogo interactivo de servicios, filtrar según categorías (acrílico, gel, esmaltado, pedicura), realizar cotizaciones estimadas en tiempo real y agendar citas de forma ágil.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnologías Utilizadas |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, TypeScript 6, React Router v8 (v8.3.0) |
| **Estilos & UI** | Tailwind CSS v4, Shadcn/ui, Lucide Icons, Montserrat & Inter Fonts |
| **Backend** | NestJS 10, TypeORM, PostgreSQL, JWT (carpeta `backend/` — ver su [README](backend/README.md)) |

---

## 📁 Estructura del Proyecto

El repositorio está organizado de la siguiente manera:

```text
ProyectoCitas/
├── frontend/                # Aplicación cliente (React + Vite)
│   ├── src/
│   │   ├── assets/          # Imágenes de servicios y recursos visuales
│   │   ├── components/      # Componentes globales reutilizables (ui, custom)
│   │   ├── mocks/           # Datos simulados de servicios/productos
│   │   ├── shop/            # Vistas y componentes del catálogo de la tienda
│   │   └── main.tsx         # Punto de entrada de React
│   ├── tsconfig.json        # Configuración de TypeScript
│   └── vite.config.ts       # Configuración de Vite & Plugins
└── backend/                 # API REST (NestJS + TypeORM + PostgreSQL)
    ├── src/
    │   ├── common/          # DTO de paginación y utilidades compartidas
    │   ├── auth/            # usuarios, registro/login, JWT y roles
    │   ├── services/        # catálogo de servicios de manicura
    │   ├── appointments/    # disponibilidad y agendado de citas
    │   └── seed/            # datos de ejemplo
    └── test/                # tests end-to-end
```

---

## 🚀 Características Clave

* **Catálogo Interactivo de Servicios:** Grid dinámico que muestra servicios populares de manicura, pedicura, acrílico y nail art.
* **Filtros Avanzados (FilterSidebar):** Búsqueda interactiva por categorías y rangos de precio.
* **Paginación Personalizada (CustomPagination):** Paginación responsiva que optimiza la navegación y se sincroniza con los parámetros de la URL (`?page=`).
* **Header & Footer Personalizados:** Componentes de navegación consistentes con diseño adaptado a móviles y pantallas de escritorio.
* **Alineación de Marca:** Diseño minimalista y moderno inspirado en interfaces de alta gama.

---

## ⚙️ Instrucciones de Instalación y Ejecución

### Requisitos Previos
* Tener instalado **Node.js** (versión 18 o superior recomendada).
* Tener instalado **Git**.

### 1. Clonar el repositorio
```bash
git clone https://github.com/jespinal899/luneBy.git
cd luneBy
```

### 2. Ejecutar el Frontend
Navega a la carpeta del frontend, instala las dependencias e inicia el servidor de desarrollo:
```bash
cd frontend
npm install
npm run dev
```
El frontend estará disponible en tu navegador local (normalmente en `http://localhost:5173`).

### 3. Compilación para Producción (Build)
Para compilar la aplicación para producción (despliegue en plataformas como Vercel o Netlify):
```bash
npm run build
```

---

## 🔒 Buenas Prácticas de Seguridad
* El proyecto **no contiene secretos versionados** (.env, llaves de API o tokens).
* Toda la configuración sensible se gestiona de forma segura a través de variables de entorno directamente en el hosting (Vercel).
