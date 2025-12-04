    # Guía de Implementación: Carga Masiva de Productos desde PDF

Esta guía detalla el proceso técnico para integrar la funcionalidad de carga de catálogos PDF en tu sistema. Basado en el análisis del archivo `LISTA DE PRECIOS MAYORISTA 15-10-2025.pdf`, hemos diseñado una solución a medida.

## 1. Análisis del Archivo PDF
El PDF proporcionado **no utiliza una estructura de tabla estándar** (filas y columnas definidas por líneas), sino un diseño de lista visual.
- **Patrón Detectado**:
  - Los productos se agrupan por bloques de texto.
  - El marcador principal es la etiqueta **"COD:"** seguida de un número.
  - El precio suele aparecer con el símbolo **"$"** (ej: `$230.432`).
  - La descripción se encuentra en las líneas anteriores al código.

**Implicación Técnica**: No podemos usar herramientas simples de "extracción de tablas". Necesitamos construir un **parser personalizado** que lea el texto línea por línea y reconstruya la información del producto basándose en estos patrones.

## 2. Flujo de Usuario Propuesto
1.  **Subida**: El usuario selecciona el archivo PDF en la web.
2.  **Procesamiento**: El sistema lee el PDF y extrae los posibles productos.
3.  **Revisión (Paso Crítico)**:
    - Se muestra una tabla con los productos detectados.
    - El usuario selecciona si los precios son **Costo** (Proveedor) o **Venta** (Público).
    - El usuario puede corregir descripciones o precios mal leídos antes de guardar.
4.  **Confirmación**: El sistema guarda o actualiza los productos en la base de datos masivamente.

## 3. Plan de Implementación Técnica

### A. Backend (Python/FastAPI)
1.  **Nueva Dependencia**: Instalar `pdfplumber` (ya verificado que funciona en tu entorno).
2.  **Lógica de Parsing (`app/services/pdf_parser.py`)**:
    - Crear una función que recorra el texto del PDF.
    - Usar Expresiones Regulares (Regex) para capturar:
        - Código: `COD:\s*(\d+)`
        - Precio: `\$\s*([\d\.,]+)`
    - Asociar el texto circundante como "Descripción".
3.  **Nuevos Endpoints**:
    - `POST /api/v1/products/upload-catalog`: Recibe el PDF, devuelve un JSON con los datos pre-procesados.
    - `POST /api/v1/products/bulk-upsert`: Recibe la lista de productos confirmados y los guarda en la BD.

### B. Frontend (React)
1.  **Nuevo Componente**: `CatalogUpload.jsx`.
2.  **Interfaz**:
    - Botón de "Seleccionar Archivo".
    - **Selector de Tipo de Precio**: "¿Qué tipo de precio contiene el catálogo?" [ Costo | Venta ].
    - **Tabla de Previsualización**:
        - Columnas: Código, Descripción, Precio Detectado, Stock (opcional).
        - Inputs editables para corregir errores de lectura.
    - Botón "Importar Productos".

## 4. Consideraciones y Riesgos
- **Precisión**: Debido a que el PDF es visual, la extracción puede tener errores (ej: unir dos líneas de descripción incorrectamente). La etapa de **Revisión** es obligatoria.
- **Formato de Precios**: El sistema debe ser inteligente para entender formatos como `$1.200,50` o `$1,200.50`.
- **Categorías**: El PDF tiene encabezados (ej: "BOMBAS"). Intentaremos detectarlos, pero puede que algunos productos queden "Sin Categoría" si el encabezado no es claro.

## 5. Decisión
Esta implementación es **totalmente viable**.

**¿Deseas proceder con este plan?**
Si es así, comenzaré por:
1.  Crear el servicio de parsing en el backend.
2.  Crear el endpoint de prueba para ver cómo lee tu PDF real.
