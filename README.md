# Hextech Boost - React Application

Aplicación web de servicios de Elo Boost para League of Legends, convertida de HTML estático a React.

## 🚀 Características

- ⚡ Vite + React para desarrollo rápido
- 🎨 Tailwind CSS para estilos
- 🧭 React Router para navegación
- 🎭 Framer Motion para transiciones suaves entre páginas
- 📱 Diseño responsive
- 🌙 Tema oscuro por defecto
- ✨ Animaciones y efectos visuales
- 📦 Datos centralizados en carpeta utils

## 📦 Instalación

```bash
npm install
```

## 🛠️ Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

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

## 🎨 Componentes

- `Header` - Navegación principal con enlaces a todas las páginas
- `Footer` - Pie de página
- `RankIcon` - Componente reutilizable para iconos de rangos
- `PageTransition` - Wrapper para transiciones suaves entre páginas

## 📁 Estructura

```
src/
├── components/       # Componentes reutilizables
├── pages/           # Páginas de la aplicación
├── utils/           # Constantes y datos estáticos
│   └── constants.js # Todas las variables centralizadas
├── App.jsx          # Router principal con AnimatePresence
├── main.jsx         # Punto de entrada
└── index.css        # Estilos globales
```

## 🔧 Tecnologías

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Framer Motion (transiciones)
- Google Fonts (Space Grotesk, Noto Sans)
- Material Symbols Icons

## ✨ Transiciones

Las transiciones entre páginas son suaves y modernas gracias a Framer Motion:
- Fade in/out con escala sutil
- Movimiento vertical suave
- Duración optimizada para UX fluida

## 📝 Notas

Este proyecto fue convertido de HTML estático a React manteniendo toda la funcionalidad y diseño original, con mejoras en:
- Organización del código
- Reutilización de componentes
- Gestión centralizada de datos
- Experiencia de usuario mejorada con transiciones
