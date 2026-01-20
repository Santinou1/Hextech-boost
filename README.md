# Hextech Boost - React Application

Aplicación web de servicios de Elo Boost para League of Legends, convertida de HTML estático a React con backend integrado.

## 🚀 Características

- ⚡ Vite + React para desarrollo rápido
- 🎨 Tailwind CSS para estilos
- 🧭 React Router para navegación
- 🎭 Framer Motion para transiciones suaves entre páginas
- 🔐 Sistema de autenticación completo
- 🌐 Integración con API REST
- 📱 Diseño responsive
- 🌙 Tema oscuro por defecto
- ✨ Animaciones y efectos visuales
- 📦 Datos centralizados y servicios organizados

## 📦 Instalación

```bash
npm install
```

## 🛠️ Desarrollo

### Iniciar Frontend
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Iniciar Backend (requerido)
```bash
cd ../Hextech-boost-back
npm start
```

El backend estará disponible en `http://localhost:3000`

## 🏗️ Build

```bash
npm run build
```

Los archivos de producción se generarán en la carpeta `dist/`

## 📄 Páginas

- **Home** (`/`) - Hero section con presentación del servicio
- **Calculator** (`/calculator`) - Calculadora de boost con selección de rangos
- **Pricing** (`/pricing`) - Precios y características de los servicios
- **Rank Icons** (`/rank-icons`) - Galería de iconos de rangos personalizados
- **Reviews** (`/reviews`) - Reseñas y testimonios de clientes
- **FAQ** (`/faq`) - Preguntas frecuentes
- **User Progress** (`/user-progress`) - Panel de progreso del usuario
- **Match History** (`/match-history`) - Historial de partidas
- **Login** (`/login`) - Inicio de sesión
- **Register** (`/register`) - Registro de usuarios

## 🎨 Componentes

- `Header` - Navegación principal con autenticación
- `Footer` - Pie de página
- `RankIcon` - Componente reutilizable para iconos de rangos
- `PageTransition` - Wrapper para transiciones suaves entre páginas
- `BoosterSelector` - Selector de boosters conectado a la API

## 📁 Estructura

```
src/
├── components/       # Componentes reutilizables
├── pages/           # Páginas de la aplicación
├── services/        # Servicios de API
│   └── api.js       # Servicios organizados por módulo
├── config/          # Configuración
│   └── apiEndpoints.js  # ⭐ TODAS las URLs de endpoints
├── context/         # Context API
│   └── AuthContext.jsx  # Contexto de autenticación
├── utils/           # Constantes y datos estáticos
│   └── constants.js # Variables centralizadas
├── App.jsx          # Router principal con AuthProvider
├── main.jsx         # Punto de entrada
└── index.css        # Estilos globales
```

## 🔐 Autenticación

El sistema de autenticación está completamente integrado:

```javascript
import { useAuth } from './context/AuthContext';

function MiComponente() {
  const { user, token, login, logout } = useAuth();
  
  // Usar user y token en tu componente
}
```

### Cuentas de Prueba

```
Admin:
- Email: admin@hextech.com
- Password: password123

Cliente:
- Email: client@test.com
- Password: password123

Booster:
- Email: booster@test.com
- Password: password123
```

## 🔐 Panel de Administración

El sistema incluye un panel de administración completo con acceso exclusivo para usuarios con rol **ADMIN**.

### Acceso al Panel
1. Inicia sesión con las credenciales de admin
2. Haz clic en "🔐 Admin" en el header (solo visible para admins)
3. O navega directamente a `/admin`

### Funcionalidades
- **📊 Estadísticas**: Dashboard con métricas clave (usuarios, órdenes, ingresos)
- **👥 Gestión de Usuarios**: Ver, crear, actualizar y eliminar usuarios
- **⭐ Gestión de Boosters**: Ver y actualizar perfiles de boosters
- **📦 Gestión de Órdenes**: Ver y administrar todas las órdenes del sistema

**Documentación completa:** [ADMIN-CREDENTIALS.md](./ADMIN-CREDENTIALS.md) | [PANEL-ADMIN-RESUMEN.md](./PANEL-ADMIN-RESUMEN.md)

## 🌐 Conexión con Backend

### Archivo Principal: `src/config/apiEndpoints.js`

**Todas las URLs de los endpoints están centralizadas aquí:**

```javascript
export const API_BASE_URL = 'http://localhost:3000/api';

export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  PROFILE: '/auth/profile',
};

export const BOOSTER_ENDPOINTS = {
  GET_ALL: '/boosters',
  GET_BY_ID: (id) => `/boosters/${id}`,
  // ... más endpoints
};

// ... otros módulos
```

### Servicios Disponibles

```javascript
import { 
  authService, 
  boosterService, 
  orderService,
  matchService,
  reviewService 
} from './services/api';

// Ejemplos de uso
await authService.login({ email, password });
await boosterService.getAll();
await orderService.create(orderData);
```

## 📚 Documentación

- **[CONEXION-API.md](./CONEXION-API.md)** - Documentación completa de la integración
- **[GUIA-RAPIDA.md](./GUIA-RAPIDA.md)** - Guía rápida de inicio
- **[COMO-AGREGAR-ENDPOINTS.md](./COMO-AGREGAR-ENDPOINTS.md)** - Cómo agregar nuevos endpoints

## 🔧 Tecnologías

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Framer Motion (transiciones)
- Axios (HTTP client)
- Context API (estado global)
- Google Fonts (Space Grotesk, Noto Sans)
- Material Symbols Icons

## ✨ Transiciones

Las transiciones entre páginas son suaves y modernas gracias a Framer Motion:
- Fade in/out con escala sutil
- Movimiento vertical suave
- Duración optimizada para UX fluida

## 🌍 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api
```

Para producción:

```env
VITE_API_URL=https://tu-api.com/api
```

## 🚀 Mejores Prácticas Implementadas

✅ **Centralización de Endpoints** - Todas las URLs en un solo archivo  
✅ **Servicios Organizados** - Agrupados por módulo (auth, boosters, orders, etc.)  
✅ **Autenticación Automática** - Interceptores de Axios para tokens  
✅ **Manejo de Errores** - Try-catch en todos los servicios  
✅ **Context API** - Estado global de autenticación  
✅ **Código Limpio** - Componentes reutilizables y bien organizados  
✅ **TypeScript-ready** - Estructura preparada para migración a TS  

## 📝 Notas

Este proyecto fue convertido de HTML estático a React y ahora incluye:
- Sistema completo de autenticación
- Integración con backend REST API
- Gestión de estado global
- Servicios organizados y escalables
- Documentación completa

## 🐛 Solución de Problemas

### Error de CORS
Verifica que el backend tenga configurado CORS para `http://localhost:5173`

### Token no se envía
Verifica que el token esté en localStorage:
```javascript
console.log(localStorage.getItem('token'));
```

### Backend no responde
Asegúrate de que el backend esté corriendo en `http://localhost:3000`

---

**¡Listo para usar! 🎉**

Para más información, consulta la documentación en los archivos MD del proyecto.
