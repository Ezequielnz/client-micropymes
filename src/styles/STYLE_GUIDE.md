# 🎨 Guía de Estilos - MicroPymes

## 📋 Sistema Híbrido: Tailwind + Clases Personalizadas

Nuestro proyecto usa un **sistema híbrido** que combina:
- **Tailwind CSS** para utilidades generales
- **Clases personalizadas** para componentes específicos
- **Paleta de colores unificada** para consistencia

---

## 🎯 Paleta de Colores

### Colores Principales
```css
/* Tailwind Classes */
bg-mp-primary      /* #2563eb - Azul moderno */
bg-mp-secondary    /* #9333ea - Violeta tecnológico */
bg-mp-success      /* #22c55e - Verde suave */
bg-mp-warning      /* #f59e0b - Naranja cálido */
bg-mp-error        /* #ef4444 - Rojo claro */
bg-mp-background   /* #f9fafb - Fondo claro base */

/* Texto */
text-mp-text           /* #111827 - Texto principal */
text-mp-text-secondary /* #6b7280 - Texto secundario */
```

### Variantes de Colores
```css
/* Primario */
bg-mp-primary-50   /* Muy claro */
bg-mp-primary-100  /* Claro */
bg-mp-primary-500  /* Normal */
bg-mp-primary-600  /* Oscuro */
bg-mp-primary-700  /* Muy oscuro */

/* Éxito, Error, Warning siguen el mismo patrón */
```

---

## 🔧 Clases Personalizadas

### Botones
```jsx
// Botones con nuestra paleta
<button className="btn-mp-primary">Primario</button>
<button className="btn-mp-secondary">Secundario</button>
<button className="btn-mp-success">Éxito</button>
<button className="btn-mp-warning">Advertencia</button>
<button className="btn-mp-error">Error</button>
```

### Cards
```jsx
// Cards básicas
<div className="card-mp">Contenido</div>

// Cards con hover
<div className="card-mp-hover">Contenido con hover</div>

// O usar Tailwind directamente
<div className="bg-white border border-gray-200 rounded-xl shadow-sm">
  Contenido
</div>
```

### Badges
```jsx
<span className="badge-mp-success">Completado</span>
<span className="badge-mp-warning">Pendiente</span>
<span className="badge-mp-error">Error</span>
<span className="badge-mp-primary">Información</span>
```

### Inputs
```jsx
<input className="input-mp" placeholder="Texto aquí..." />

// O usar Tailwind
<input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mp-primary-500" />
```

### Alertas
```jsx
<div className="alert-mp-success">Mensaje de éxito</div>
<div className="alert-mp-warning">Mensaje de advertencia</div>
<div className="alert-mp-error">Mensaje de error</div>
<div className="alert-mp-info">Mensaje informativo</div>
```

---

## 📄 Estructura de Página

### Contenedores de Página
```jsx
// Página completa
<div className="page-container">
  {/* Header */}
  <header className="page-header">
    <div className="page-content">
      {/* Contenido del header */}
    </div>
  </header>
  
  {/* Contenido principal */}
  <main className="page-content">
    {/* Tu contenido aquí */}
  </main>
</div>
```

### Dashboard
```jsx
// Métricas
<div className="metric-card-mp">
  <div className="metric-value-mp">123</div>
  <div className="metric-label-mp">Productos</div>
</div>

// Acciones rápidas
<div className="quick-action-mp">
  <Icon className="w-8 h-8 text-mp-primary mb-2" />
  <span>Acción</span>
</div>
```

---

## 🎯 Cuándo Usar Cada Enfoque

### ✅ Usar Clases Personalizadas (MP)
- Componentes que se repiten mucho
- Elementos específicos del dashboard
- Cuando necesitas consistencia garantizada

### ✅ Usar Tailwind Directamente
- Layouts y espaciado
- Utilidades generales (flex, grid, etc.)
- Ajustes específicos de una sola vez

### ✅ Usar Home.css
- Estilos muy específicos
- Componentes únicos
- Cuando necesitas CSS puro

---

## 📝 Ejemplos Prácticos

### Página de Productos
```jsx
function ProductsPage() {
  return (
    <div className="page-container">
      <header className="page-header">
        <div className="page-content">
          <h1 className="text-2xl font-bold text-mp-text">Productos</h1>
          <p className="text-mp-text-secondary">Gestiona tu inventario</p>
        </div>
      </header>
      
      <main className="page-content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="card-mp-hover">
              <h3 className="font-semibold text-mp-text">{product.name}</h3>
              <p className="text-mp-text-secondary">{product.description}</p>
              <div className="flex gap-2 mt-4">
                <button className="btn-mp-primary">Editar</button>
                <button className="btn-mp-error">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
```

### Dashboard Metrics
```jsx
function DashboardMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="metric-card-mp">
        <div className="metric-value-mp">1,234</div>
        <div className="metric-label-mp">Productos</div>
        <div className="text-mp-success text-sm mt-1">+12% este mes</div>
      </div>
      
      <div className="metric-card-mp">
        <div className="metric-value-mp">567</div>
        <div className="metric-label-mp">Clientes</div>
        <div className="text-mp-warning text-sm mt-1">-2% este mes</div>
      </div>
    </div>
  );
}
```

---

## 🚀 Migración Gradual

### Prioridad de Migración
1. **Páginas principales** (Dashboard, Home)
2. **Componentes reutilizables** (Cards, Buttons)
3. **Páginas secundarias**
4. **Componentes específicos**

### Proceso de Migración
1. Identificar elementos que usan colores hardcodeados
2. Reemplazar con clases de nuestra paleta
3. Probar que se vea igual o mejor
4. Documentar cambios

---

## 🎨 Colores de Referencia

```css
/* Nuestra paleta completa */
:root {
  --mp-primary: #2563eb;      /* Azul moderno, confiable */
  --mp-secondary: #9333ea;    /* Violeta tecnológico */
  --mp-success: #22c55e;      /* Verde suave */
  --mp-warning: #f59e0b;      /* Naranja cálido */
  --mp-error: #ef4444;        /* Rojo claro */
  --mp-background: #f9fafb;   /* Fondo claro base */
  --mp-text: #111827;         /* Texto principal */
  --mp-text-secondary: #6b7280; /* Texto secundario */
}
```

---

## 📚 Recursos Adicionales

- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Color Picker**: https://tailwindcss.com/docs/customizing-colors
- **Archivo de utilidades**: `src/styles/utilities.css`
- **Configuración**: `tailwind.config.js` 