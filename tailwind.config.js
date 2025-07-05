/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🔵 Colores Primarios - Azul Tecnológico Moderno
        'erp-primary': '#0ea5e9',        // Azul moderno y profesional
        'erp-primary-hover': '#0284c7',  // Versión más oscura para hover
        'erp-primary-light': '#bae6fd',  // Azul suave para fondos
        'erp-primary-50': '#f0f9ff',
        'erp-primary-100': '#e0f2fe',
        'erp-primary-200': '#bae6fd',
        'erp-primary-300': '#7dd3fc',
        'erp-primary-400': '#38bdf8',
        'erp-primary-500': '#0ea5e9',
        'erp-primary-600': '#0284c7',
        'erp-primary-700': '#0369a1',
        'erp-primary-800': '#075985',
        'erp-primary-900': '#0c4a6e',
        
        // ⚫ Colores Neutros - Grises Modernos
        'erp-neutral-50': '#fafafa',     // Fondo claro
        'erp-neutral-100': '#f5f5f5',
        'erp-neutral-200': '#e5e5e5',    // Bordes claros
        'erp-neutral-300': '#d4d4d4',
        'erp-neutral-400': '#a3a3a3',
        'erp-neutral-500': '#737373',
        'erp-neutral-600': '#525252',
        'erp-neutral-700': '#404040',
        'erp-neutral-800': '#262626',
        'erp-neutral-900': '#171717',    // Texto principal
        
        // 🌓 Colores para Modo Oscuro
        'erp-dark-bg': '#18181b',        // Fondo oscuro
        'erp-dark-surface': '#27272a',   // Superficie oscura
        'erp-dark-border': '#3f3f46',    // Bordes oscuros
        'erp-dark-text': '#fafafa',      // Texto claro
        
        // 🎯 Colores Semánticos
        'erp-success': '#10b981',        // Verde confiable
        'erp-success-50': '#ecfdf5',
        'erp-success-100': '#d1fae5',
        'erp-success-200': '#a7f3d0',
        'erp-success-500': '#10b981',
        'erp-success-600': '#059669',
        'erp-success-700': '#047857',
        
        'erp-warning': '#f59e0b',        // Ámbar llamativo
        'erp-warning-50': '#fffbeb',
        'erp-warning-100': '#fef3c7',
        'erp-warning-200': '#fde68a',
        'erp-warning-500': '#f59e0b',
        'erp-warning-600': '#d97706',
        'erp-warning-700': '#b45309',
        
        'erp-error': '#ef4444',          // Rojo claro
        'erp-error-50': '#fef2f2',
        'erp-error-100': '#fee2e2',
        'erp-error-200': '#fecaca',
        'erp-error-500': '#ef4444',
        'erp-error-600': '#dc2626',
        'erp-error-700': '#b91c1c',
        
        'erp-info': '#3b82f6',           // Azul informativo
        'erp-info-50': '#eff6ff',
        'erp-info-100': '#dbeafe',
        'erp-info-200': '#bfdbfe',
        'erp-info-500': '#3b82f6',
        'erp-info-600': '#2563eb',
        'erp-info-700': '#1d4ed8',
        
        // Mantener compatibilidad con shadcn/ui
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0ea5e9", // Usar nuestro azul tecnológico
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#6b7280", // Gris neutral
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444", // Usar nuestro rojo claro
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#fafafa", // Usar nuestro fondo claro
          foreground: "#737373", // Gris neutral
        },
        accent: {
          DEFAULT: "#f5f5f5",
          foreground: "#171717", // Texto principal
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#171717",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#171717",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [
    // @tailwindcss/line-clamp is now included by default in Tailwind CSS v3.3+
  ],
} 