import React, { useState } from 'react';
import { Upload, Check, AlertCircle, FileText, FileImage, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import api from '../utils/api';

/**
 * UniversalImportModal component for importing entities from an Excel or PDF file using AI.
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to close the modal
 * @param {string} props.entityType - 'productos', 'clientes' or 'proveedores'
 * @param {string} props.businessId - The business ID
 * @param {function} props.onImportSuccess - Callback when import finishes successfully
 */
const UniversalImportModal = ({ isOpen, onClose, entityType, businessId, onImportSuccess }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Importing
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [priceType, setPriceType] = useState('costo'); // 'costo' or 'venta' (only for productos)
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const entityName = entityType.charAt(0).toUpperCase() + entityType.slice(1);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo PDF o Excel.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/businesses/${businessId}/import/parse-file/${entityType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000 // Aumentamos el timeout porque la IA puede tardar unos segundos
      });
      
      const data = response.data;
      if (!data.success || !data.data_preview || data.data_preview.length === 0) {
          throw new Error('No se encontraron datos válidos en el archivo.');
      }

      // Añadimos un ID temporal para la tabla de edición
      const dataWithKeys = data.data_preview.map((item, index) => ({
          ...item,
          _tempId: index
      }));

      setParsedData(dataWithKeys);
      setStep(2);
    } catch (err) {
      console.error('Error al subir archivo:', err);
      setError(err.response?.data?.detail || err.message || 'Ocurrió un error al procesar el archivo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (id, field, value) => {
    setParsedData(prev => prev.map(item => {
        if (item._tempId === id) {
            return { ...item, [field]: value };
        }
        return item;
    }));
  };

  const handleRemoveRow = (id) => {
    setParsedData(prev => prev.filter(item => item._tempId !== id));
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      setError('No hay datos válidos para importar.');
      return;
    }

    setLoading(true);
    setStep(3);
    setError(null);

    try {
      // Limpiamos la data temporal
      const dataToImport = parsedData.map(item => {
          const cleanItem = { ...item };
          delete cleanItem._tempId;
          return cleanItem;
      });

      const payload = {
          data: dataToImport,
          tipo_precio: entityType === 'productos' ? priceType : undefined
      };

      // Simulamos progreso ya que es una sola llamada bulk
      setProgress(50);

      const response = await api.post(`/businesses/${businessId}/import/bulk-upsert/${entityType}`, payload);
      
      setProgress(100);
      setTimeout(() => {
          setLoading(false);
          if (onImportSuccess) onImportSuccess();
          onClose();
      }, 500);

    } catch (err) {
      console.error(`Error en importación masiva:`, err);
      setError(err.response?.data?.detail || err.message || 'Error guardando datos');
      setStep(2); // Volvemos a review si falla
      setLoading(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setStep(1);
    setError(null);
    setParsedData([]);
    setProgress(0);
    onClose();
  };

  const isProducts = entityType === 'productos';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-black" style={{ color: 'black' }}>
            Importador Inteligente de {entityName}
          </h2>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Sube un archivo <strong>Excel (.xlsx)</strong> o un <strong>PDF</strong> con tu listado de {entityName.toLowerCase()}.</p>
                <p className="text-sm text-gray-500 mb-4">Nuestra Inteligencia Artificial leerá el documento, mapeará las columnas e ignorará la basura automáticamente.</p>
              </div>
              
              <div className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                <div className="flex justify-center space-x-4 mb-4">
                  <FileText className="h-12 w-12 text-green-500" />
                  <FileImage className="h-12 w-12 text-red-400" />
                </div>
                <input
                  type="file"
                  id="universal-upload"
                  className="hidden"
                  accept=".xlsx, .xls, .pdf"
                  onChange={handleFileChange}
                />
                <label 
                  htmlFor="universal-upload"
                  className="cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Examinar Archivos
                </label>
                {file && (
                  <div className="mt-4 text-sm font-medium text-gray-700 bg-gray-100 p-2 rounded-md inline-block max-w-full truncate">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-blue-50 text-blue-800 p-4 rounded-md">
                <div className="flex items-start">
                  <Check className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Extracción Exitosa con IA</h3>
                    <p className="text-sm mt-1 text-blue-700">
                      Se detectaron {parsedData.length} registros. Puedes revisar y corregir cualquier dato antes de importar.
                      Si el sistema encuentra registros existentes, los actualizará automáticamente (Upsert).
                    </p>
                  </div>
                </div>
                {isProducts && (
                  <div className="flex flex-col items-end">
                      <span className="text-xs font-semibold mb-1 text-blue-900">Los precios detectados son:</span>
                      <div className="flex bg-white p-1 rounded-md shadow-sm border border-blue-200">
                          <button
                              onClick={() => setPriceType('costo')}
                              className={`px-3 py-1 text-xs rounded-md transition-colors ${priceType === 'costo'
                                  ? 'bg-blue-600 text-white font-medium'
                                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
                                  }`}
                          >
                              Costo (Proveedor)
                          </button>
                          <button
                              onClick={() => setPriceType('venta')}
                              className={`px-3 py-1 text-xs rounded-md transition-colors ${priceType === 'venta'
                                  ? 'bg-blue-600 text-white font-medium'
                                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
                                  }`}
                          >
                              Venta (Público)
                          </button>
                      </div>
                  </div>
                )}
              </div>

              <div className="border rounded-md overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-medium text-sm">
                      {isProducts ? (
                          <>
                            <th className="p-3 border-b">Código</th>
                            <th className="p-3 border-b">Nombre / Descripción</th>
                            <th className="p-3 border-b text-right">Precio</th>
                            <th className="p-3 border-b text-right">Stock</th>
                            <th className="p-3 border-b text-center">Unidades</th>
                          </>
                      ) : (
                          <>
                            <th className="p-3 border-b">Razón Social / Nombre</th>
                            <th className="p-3 border-b">Documento (CUIT/DNI)</th>
                            <th className="p-3 border-b">Teléfono</th>
                            <th className="p-3 border-b">Email</th>
                          </>
                      )}
                      <th className="p-3 border-b text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {parsedData.map((item) => (
                      <tr key={item._tempId} className="hover:bg-gray-50">
                        {isProducts ? (
                            <>
                                <td className="p-2">
                                    <input 
                                        type="text" 
                                        value={item.codigo || ''} 
                                        onChange={e => handleFieldChange(item._tempId, 'codigo', e.target.value)}
                                        className="w-full p-1 border border-gray-200 rounded text-black" 
                                        placeholder="Automático"
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        type="text" 
                                        value={item.nombre || item.descripcion || ''} 
                                        onChange={e => handleFieldChange(item._tempId, 'nombre', e.target.value)}
                                        className="w-full p-1 border border-gray-200 rounded text-black" 
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={item.precio || ''} 
                                        onChange={e => handleFieldChange(item._tempId, 'precio', parseFloat(e.target.value))}
                                        className="w-24 p-1 border border-gray-200 rounded text-right text-black" 
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        type="number" 
                                        value={item.stock || 0} 
                                        onChange={e => handleFieldChange(item._tempId, 'stock', parseInt(e.target.value))}
                                        className="w-20 p-1 border border-gray-200 rounded text-right text-black" 
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        type="text" 
                                        value={item.unidades || ''} 
                                        onChange={e => handleFieldChange(item._tempId, 'unidades', e.target.value)}
                                        className="w-20 p-1 border border-gray-200 rounded text-center text-black" 
                                        placeholder="Ej: u, kg, lt"
                                    />
                                </td>
                            </>
                        ) : (
                            <>
                                <td className="p-2">
                                    <input 
                                        type="text" 
                                        value={item.razon_social || ''} 
                                        onChange={e => handleFieldChange(item._tempId, 'razon_social', e.target.value)}
                                        className="w-full p-1 border border-gray-200 rounded text-black" 
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        type="text" 
                                        value={item.documento_numero || ''} 
                                        onChange={e => handleFieldChange(item._tempId, 'documento_numero', e.target.value)}
                                        className="w-full p-1 border border-gray-200 rounded text-black" 
                                        placeholder="Generar automático"
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        type="text" 
                                        value={item.telefono || ''} 
                                        onChange={e => handleFieldChange(item._tempId, 'telefono', e.target.value)}
                                        className="w-full p-1 border border-gray-200 rounded text-black" 
                                    />
                                </td>
                                <td className="p-2">
                                    <input 
                                        type="text" 
                                        value={item.email || ''} 
                                        onChange={e => handleFieldChange(item._tempId, 'email', e.target.value)}
                                        className="w-full p-1 border border-gray-200 rounded text-black" 
                                    />
                                </td>
                            </>
                        )}
                        <td className="p-2 text-center">
                            <button 
                                onClick={() => handleRemoveRow(item._tempId)}
                                className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-xs"
                            >
                                Quitar
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-10">
              <h3 className="text-lg font-medium mb-6">Importando datos...</h3>
              <div className="w-full max-w-md bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-gray-500 font-medium">Actualizando base de datos</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={resetModal}
            disabled={loading && step === 3}
          >
            Cancelar
          </Button>
          
          {step === 1 && (
            <Button 
              onClick={handleUpload} 
              disabled={!file || loading}
            >
              {loading ? 'Analizando con IA...' : 'Analizar Archivo'}
            </Button>
          )}

          {step === 2 && (
            <Button 
              onClick={handleImport} 
              disabled={loading || parsedData.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? 'Preparando...' : `Confirmar Importación (${parsedData.length})`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversalImportModal;
