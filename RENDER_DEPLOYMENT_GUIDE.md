# Guía de Despliegue Frontend en Render

## Resumen del Proyecto

Frontend desarrollado con:
- **React 19** + **TypeScript**
- **Vite** para build y desarrollo
- **Tailwind CSS** + componentes UI custom
- **React Router** para enrutamiento
- **Axios** para API calls
- **Lucide React** para iconos

## Dependencias Verificadas ✅

Todas las dependencias son compatibles con Render y servicios de hosting estático:

### Dependencias de Producción
```json
{
  "@radix-ui/react-checkbox": "^1.3.2",      // ✅ Compatible
  "@radix-ui/react-slot": "^1.2.3",         // ✅ Compatible
  "@tailwindcss/line-clamp": "^0.4.4",      // ✅ Compatible
  "axios": "^1.9.0",                        // ✅ Compatible
  "class-variance-authority": "^0.7.1",     // ✅ Compatible
  "clsx": "^2.1.1",                         // ✅ Compatible
  "lucide-react": "^0.511.0",               // ✅ Compatible
  "react": "^19.1.0",                       // ✅ Compatible
  "react-dom": "^19.1.0",                   // ✅ Compatible
  "react-router-dom": "^7.6.0",             // ✅ Compatible
  "tailwind-merge": "^3.3.0"                // ✅ Compatible
}
```

### Dependencias de Desarrollo
```json
{
  "@eslint/js": "^9.25.0",                  // ✅ Compatible
  "@types/node": "^22.15.24",               // ✅ Compatible
  "@types/react": "^19.1.2",                // ✅ Compatible
  "@types/react-dom": "^19.1.2",            // ✅ Compatible
  "@typescript-eslint/eslint-plugin": "^7.0.0", // ✅ Compatible
  "@typescript-eslint/parser": "^7.0.0",    // ✅ Compatible
  "@vitejs/plugin-react": "^4.4.1",         // ✅ Compatible
  "autoprefixer": "^10.4.21",               // ✅ Compatible
  "eslint": "^9.25.0",                      // ✅ Compatible
  "eslint-plugin-react-hooks": "^5.2.0",    // ✅ Compatible
  "eslint-plugin-react-refresh": "^0.4.19", // ✅ Compatible
  "globals": "^16.0.0",                     // ✅ Compatible
  "postcss": "^8.5.4",                      // ✅ Compatible
  "tailwindcss": "^3.4.17",                 // ✅ Compatible
  "typescript": "^5.2.2",                   // ✅ Compatible
  "vite": "^6.3.5"                          // ✅ Compatible
}
```

## Configuración Actual

### ✅ Variables de Entorno
El proyecto está configurado para usar `VITE_API_URL`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
```

### ✅ Build Configuration
- Build command: `npm run build` (TypeScript + Vite)
- Output directory: `dist/`
- SPA routing configurado

## Pasos para Desplegar en Render

### 1. **Crear Static Site en Render**

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en "New" → "Static Site"
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `micro_pymes`

### 2. **Configuración del Build**

```yaml
# Configuración básica
Root Directory: client
Build Command: npm ci --legacy-peer-deps && npm run build
Publish Directory: client/dist

# Configuración avanzada
Node Version: 18.18.0
```

### 3. **Variables de Entorno**

En el dashboard de Render, ve a "Environment" y agrega:

```bash
# URL del backend (reemplaza con tu URL de Render del backend)
VITE_API_URL=https://tu-backend-micropymes.onrender.com/api/v1

# Configuración adicional
NODE_ENV=production
```

### 4. **Configuración de Redirects**

Crear archivo `_redirects` en el directorio `public/`:

```
/*    /index.html   200
```

Este archivo es necesario para que React Router funcione correctamente en producción.

### 5. **Headers de Seguridad (Opcional)**

Crear archivo `_headers` en el directorio `public/`:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Verificación del Despliegue

### 1. **URLs de Verificación**

Una vez desplegado, verifica que estos endpoints funcionen:

```bash
# Homepage
https://tu-frontend.onrender.com/

# Login
https://tu-frontend.onrender.com/login

# Dashboard (requiere autenticación)
https://tu-frontend.onrender.com/dashboard
```

### 2. **Verificar Conexión API**

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Network"
3. Haz login o cualquier acción que llame a la API
4. Verifica que las llamadas vayan a tu backend en Render

### 3. **Test de Funcionalidades Críticas**

- ✅ Login/Register
- ✅ Navegación entre páginas
- ✅ Llamadas a la API
- ✅ Manejo de autenticación
- ✅ Responsive design

## Optimizaciones de Producción

### Performance
- ✅ Code splitting automático con Vite
- ✅ Tree shaking habilitado
- ✅ Assets optimizados
- ✅ Lazy loading de componentes

### SEO y Meta Tags
El `index.html` incluye:
- ✅ Meta viewport para mobile
- ✅ Título descriptivo
- ✅ Favicon

## Troubleshooting Común

### 1. **Error "vite: not found" durante build**
- **Problema:** `sh: 1: vite: not found` durante el build
- **Causa:** `npm ci` no instala devDependencies por defecto, y vite está ahí
- **Solución:** 
  ```bash
  # Opción 1: Incluir devDependencies (recomendado)
  npm ci --legacy-peer-deps --include=dev && npm run build
  
  # Opción 2: Usar npm install en lugar de npm ci
  npm install --legacy-peer-deps && npm run build
  
  # Opción 3: En Render Dashboard, configurar Build Command:
  # npm ci --legacy-peer-deps --include=dev && npm run build
  ```

### 2. **Error ERESOLVE (Conflicto de dependencias)**
- **Problema:** `npm error ERESOLVE could not resolve` con ESLint/TypeScript
- **Solución:** 
  ```bash
  # Opción 1: Usar --legacy-peer-deps (recomendado)
  npm ci --legacy-peer-deps --include=dev
  
  # Opción 2: Actualizar dependencias en package.json
  # @typescript-eslint/eslint-plugin: "^8.0.0"
  # @typescript-eslint/parser: "^8.0.0"
  
  # Opción 3: Forzar resolución (último recurso)
  npm ci --force --include=dev
  ```

### 3. **Render ignora render.yaml**
- **Problema:** Render ejecuta comandos diferentes a los configurados
- **Solución:** 
  1. Ve a tu servicio en Render Dashboard
  2. Settings → Build & Deploy
  3. Asegúrate de que "Build Command" esté vacío (para usar render.yaml)
  4. O configura manualmente: `npm ci --legacy-peer-deps --include=dev && npm run build`

### 4. **Error "Publish directory client/dist does not exist"**
- **Problema:** Render no encuentra el directorio dist después del build
- **Causa:** Falta `rootDir` en render.yaml
- **Solución:** 
  ```yaml
  services:
    - type: web
      env: static
      rootDir: client  # Importante!
      buildCommand: npm ci --legacy-peer-deps --include=dev && npm run build
      staticPublishPath: ./dist
  ```

### 5. **Warning: chunks grandes (>500KB)**
- **Problema:** Advertencia sobre chunks demasiado grandes
- **Solución:** Ya optimizado en `vite.config.ts` con code splitting granular
- **No crítico:** El build funciona, es solo una advertencia de rendimiento

### 6. **Error 404 en rutas**
- **Problema:** Las rutas de React Router devuelven 404
- **Solución:** Verificar que existe `_redirects` en `public/`

### 7. **API calls fallan**
- **Problema:** Errores CORS o 404 en llamadas API
- **Solución:** Verificar `VITE_API_URL` y CORS en backend

### 8. **Build falla**
- **Problema:** Errores de TypeScript o ESLint
- **Solución:** Verificar `npm run build` localmente primero

### 9. **Estilos no se cargan**
- **Problema:** Tailwind CSS no funciona
- **Solución:** Verificar `postcss.config.js` y `tailwind.config.js`

## Comandos Útiles

```bash
# Verificar build localmente
cd client
npm install
npm run build
npm run preview

# Linter y verificaciones
npm run lint

# Test de producción local
npx serve dist
```

## Alternativas de Hosting

Si prefieres otras opciones además de Render:

### 1. **Vercel** (Recomendado para React)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy desde el directorio client/
cd client
vercel --prod

# Variables de entorno en Vercel Dashboard:
# VITE_API_URL=https://tu-backend.onrender.com/api/v1
```

### 2. **Netlify**
```bash
# Drag & drop el directorio dist/ en Netlify
# O conectar con GitHub y configurar:
# Build command: npm run build
# Publish directory: dist
# Environment variables: VITE_API_URL
```

### 3. **GitHub Pages** (Solo para repositorios públicos)
```bash
# Instalar gh-pages
npm install --save-dev gh-pages

# Agregar script a package.json:
# "deploy": "gh-pages -d dist"

# Deploy:
npm run build
npm run deploy
```

### 4. **Firebase Hosting**
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar
firebase init hosting

# Deploy
npm run build
firebase deploy
```

## Scripts Adicionales

Hemos agregado scripts útiles en `package.json`:

```bash
# Build con lint
npm run build:production

# Servir localmente el build
npm run serve

# Verificar TypeScript sin build
npm run check
```

## Siguiente Paso: Custom Domain (Opcional)

Una vez desplegado, puedes configurar un dominio personalizado:

1. Ve a "Settings" → "Custom Domains" en Render
2. Agrega tu dominio
3. Configura los DNS records según las instrucciones
4. Actualiza `ALLOWED_ORIGINS` en el backend

## Conexión Backend-Frontend

Una vez que tengas ambos servicios desplegados:

1. **Backend en Render:** `https://tu-backend.onrender.com`
2. **Frontend en Render:** `https://tu-frontend.onrender.com`

3. **Configurar CORS en Backend:**
   ```bash
   ALLOWED_ORIGINS=https://tu-frontend.onrender.com
   ```

4. **Configurar API URL en Frontend:**
   ```bash
   VITE_API_URL=https://tu-backend.onrender.com/api/v1
   ```

---

**✅ Estado:** Listo para despliegue. Todas las dependencias son compatibles y la configuración está optimizada para producción. 