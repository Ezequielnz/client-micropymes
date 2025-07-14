import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
// import { Checkbox } from '@/components/ui/checkbox';
import { productAPI } from '../utils/api';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Download,
  Loader2,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const ImportProducts = ({ businessId, onImportComplete, onClose }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Confirm, 4: Complete
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [temporaryProducts, setTemporaryProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [createNewCategories, setCreateNewCategories] = useState(true);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Verificar extensión del archivo
      const fileName = selectedFile.name.toLowerCase();
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValidExtension) {
        setError('Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV (.csv)');
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
        setError('El archivo no puede ser mayor a 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 Subiendo archivo:', file.name);
      const result = await productAPI.uploadImportFile(businessId, formData);
      console.log('✅ Resultado de importación:', result);
      
      setImportResult(result);
      
      // Verificar si hay productos temporales
      if (result.productos_temporales && result.productos_temporales.length > 0) {
        setTemporaryProducts(result.productos_temporales);
        // Seleccionar automáticamente productos sin errores
        const validProducts = result.productos_temporales.filter(p => !p.errores || p.errores.length === 0);
        setSelectedProducts(validProducts.map(p => p.id));
        console.log('📋 Productos válidos seleccionados:', validProducts.length);
      } else {
        console.log('⚠️ No se encontraron productos temporales');
        // Intentar cargar productos temporales por separado
        try {
          const temporaryProducts = await productAPI.getTemporaryProducts(businessId);
          console.log('📋 Productos temporales cargados por separado:', temporaryProducts);
          setTemporaryProducts(temporaryProducts);
          const validProducts = temporaryProducts.filter(p => !p.errores || p.errores.length === 0);
          setSelectedProducts(validProducts.map(p => p.id));
        } catch (tempError) {
          console.error('❌ Error al cargar productos temporales:', tempError);
          setError('Error al cargar productos temporales. Verifica que el archivo tenga el formato correcto.');
          return;
        }
      }
      
      setStep(2);
    } catch (err) {
      console.error('❌ Error en upload:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Error al procesar el archivo';
      setError(errorMessage);
      
      // Mostrar más detalles del error en consola
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProductToggle = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    const validProducts = temporaryProducts.filter(p => !p.errores.length);
    setSelectedProducts(validProducts.map(p => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedProducts([]);
  };

  const handleConfirmImport = async () => {
    if (selectedProducts.length === 0) {
      setError('Selecciona al menos un producto para importar');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const confirmationData = {
        productos_ids: selectedProducts,
        crear_categorias_nuevas: createNewCategories,
        sobrescribir_existentes: overwriteExisting
      };

      const result = await productAPI.confirmImport(businessId, confirmationData);
      setFinalResult(result);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error al confirmar la importación');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (step > 1) {
      try {
        await productAPI.cancelImport(businessId);
      } catch (err) {
        console.error('Error al cancelar importación:', err);
      }
    }
    onClose();
  };

  const downloadTemplate = () => {
    // Crear un template Excel más completo
    const excelData = [
      ['Nombre', 'Descripcion', 'Codigo', 'Precio Venta', 'Precio Compra', 'Stock Actual', 'Stock Minimo', 'Categoria'],
      ['Laptop HP', 'Laptop HP Pavilion 15 pulgadas', 'LAP001', '1200.00', '1000.00', '10', '2', 'Electrónicos'],
      ['Mouse Inalámbrico', 'Mouse inalámbrico Logitech', 'MOU001', '25.99', '18.00', '50', '10', 'Accesorios'],
      ['Teclado Mecánico', 'Teclado mecánico RGB', 'TEC001', '89.99', '65.00', '20', '5', 'Accesorios'],
      ['Monitor 24"', 'Monitor LED 24 pulgadas Full HD', 'MON001', '299.99', '220.00', '8', '3', 'Electrónicos'],
      ['Silla Oficina', 'Silla ergonómica para oficina', 'SIL001', '150.00', '120.00', '15', '3', 'Muebles']
    ];
    
    // Convertir a CSV
    const csvContent = excelData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_productos.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileSpreadsheet className="mx-auto h-12 w-12 text-blue-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Importar productos desde Excel
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Sube un archivo Excel con la información de tus productos
        </p>
        
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="mb-4"
        >
          <Download className="h-4 w-4 mr-2" />
          Descargar plantilla
        </Button>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Arrastra tu archivo aquí o haz clic para seleccionar
            </p>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Seleccionar archivo
            </Button>
          </div>
        </div>
      </div>

      {file && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileSpreadsheet className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                {file.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleUpload} 
          disabled={!file || loading}
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Procesar archivo
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Revisar productos importados
        </h3>
        <p className="text-sm text-gray-600">
          Revisa y selecciona los productos que deseas importar
        </p>
      </div>

      {importResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {importResult.total_filas}
                </div>
                <div className="text-sm text-gray-600">Total filas</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importResult.filas_validas}
                </div>
                <div className="text-sm text-gray-600">Productos válidos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {importResult.filas_con_errores}
                </div>
                <div className="text-sm text-gray-600">Con errores</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Seleccionar todos
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeselectAll}>
            Deseleccionar todos
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          {selectedProducts.length} productos seleccionados
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto border rounded-lg">
        {temporaryProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="font-medium mb-2">No se encontraron productos para importar.</p>
            <div className="text-sm space-y-2">
              <p>Posibles causas:</p>
              <ul className="text-left max-w-md mx-auto space-y-1">
                <li>• El archivo no tiene encabezados (headers)</li>
                <li>• Las columnas no tienen nombres reconocibles</li>
                <li>• El archivo está vacío o corrupto</li>
                <li>• Formato de archivo no compatible</li>
              </ul>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800 mb-2">💡 Sugerencias:</p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Usa nombres como: Nombre, Precio, Stock, Categoria</li>
                  <li>• Asegúrate de que la primera fila tenga los títulos</li>
                  <li>• Guarda como Excel (.xlsx) o CSV</li>
                  <li>• Descarga nuestra plantilla como ejemplo</li>
                </ul>
              </div>
              {importResult && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800 mb-2">🔍 Información de debugging:</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Total filas procesadas: {importResult.total_filas || 0}</p>
                    <p>Filas válidas: {importResult.filas_validas || 0}</p>
                    <p>Filas con errores: {importResult.filas_con_errores || 0}</p>
                    {importResult.columnas_originales && (
                      <p>Columnas detectadas: {importResult.columnas_originales.join(', ')}</p>
                    )}
                    {importResult.errores_generales && importResult.errores_generales.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Errores:</p>
                        {importResult.errores_generales.slice(0, 3).map((error, index) => (
                          <p key={index} className="text-red-600">• {error}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Seleccionar
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Producto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Precio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {temporaryProducts.map((product) => {
                const hasErrors = product.errores && product.errores.length > 0;
                return (
                  <tr key={product.id} className={hasErrors ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductToggle(product.id)}
                        disabled={hasErrors}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.nombre || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.codigo && `Código: ${product.codigo}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      ${product.precio_venta || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {product.stock_actual || 0}
                    </td>
                    <td className="px-4 py-3">
                      {hasErrors ? (
                        <div>
                          <Badge variant="destructive" className="mb-1">
                            Error
                          </Badge>
                          <div className="text-xs text-red-600">
                            {product.errores.join(', ')}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Válido
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={() => setStep(3)} 
          disabled={selectedProducts.length === 0}
        >
          Continuar
        </Button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Confirmar importación
        </h3>
        <p className="text-sm text-gray-600">
          Revisa las opciones de importación antes de continuar
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm">
          <strong>Productos a importar:</strong> {selectedProducts.length}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="createCategories"
            checked={createNewCategories}
            onChange={(e) => setCreateNewCategories(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <Label htmlFor="createCategories" className="text-sm">
            Crear categorías nuevas automáticamente
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="overwriteExisting"
            checked={overwriteExisting}
            onChange={(e) => setOverwriteExisting(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <Label htmlFor="overwriteExisting" className="text-sm">
            Sobrescribir productos existentes (por código)
          </Label>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setStep(2)}>
          Volver
        </Button>
        <Button 
          onClick={handleConfirmImport} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Confirmar importación
        </Button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          ¡Importación completada!
        </h3>
        <p className="text-sm text-gray-600">
          Los productos han sido importados exitosamente
        </p>
      </div>

      {finalResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {finalResult.productos_creados}
                </div>
                <div className="text-sm text-gray-600">Productos creados</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {finalResult.productos_actualizados}
                </div>
                <div className="text-sm text-gray-600">Productos actualizados</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {finalResult.categorias_creadas}
                </div>
                <div className="text-sm text-gray-600">Categorías creadas</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {finalResult?.errores && finalResult.errores.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div>Algunos productos no pudieron ser importados:</div>
            <ul className="list-disc list-inside mt-2">
              {finalResult.errores.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center">
        <Button 
          onClick={() => {
            onImportComplete();
            onClose();
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          Finalizar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                  Importación masiva de productos
                </CardTitle>
                <CardDescription>
                  Paso {step} de 4
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {step === 1 && renderUploadStep()}
            {step === 2 && renderReviewStep()}
            {step === 3 && renderConfirmStep()}
            {step === 4 && renderCompleteStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportProducts; 