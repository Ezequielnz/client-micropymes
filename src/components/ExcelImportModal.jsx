import React, { useState } from 'react';
import { Upload, X, Check, AlertCircle, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import api from '../utils/api';

/**
 * ExcelImportModal component for importing entities from an Excel file.
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to close the modal
 * @param {string} props.entityType - 'clientes' or 'proveedores'
 * @param {string} props.businessId - The business ID
 * @param {function} props.onImportSuccess - Callback when import finishes successfully
 * @param {function} props.createEntity - API function to create a single entity: async (businessId, data) => {}
 */
const ExcelImportModal = ({ isOpen, onClose, entityType, businessId, onImportSuccess, createEntity }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map & Preview, 3: Importing
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const entityName = entityType === 'clientes' ? 'Clientes' : 'Proveedores';

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo Excel.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/businesses/${businessId}/import/parse-excel/${entityType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setImportResult(response.data);
      setStep(2);
    } catch (err) {
      console.error('Error al subir archivo:', err);
      setError(err.response?.data?.detail || 'Ocurrió un error al procesar el archivo. Verifica que el formato sea correcto.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importResult || !importResult.data_preview || importResult.data_preview.length === 0) {
      setError('No hay datos válidos para importar.');
      return;
    }

    setLoading(true);
    setStep(3);
    setError(null);

    const dataToImport = importResult.data_preview;
    const mapping = importResult.mapeo_automatico;
    
    // Convert Excel row to Entity object
    const mapRowToEntity = (row) => {
      const entity = {};
      Object.keys(mapping).forEach(excelColumn => {
        const dbField = mapping[excelColumn];
        if (row[excelColumn] !== undefined && row[excelColumn] !== null) {
          entity[dbField] = row[excelColumn];
        }
      });
      return entity;
    };

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < dataToImport.length; i++) {
      try {
        const entityData = mapRowToEntity(dataToImport[i]);
        if (Object.keys(entityData).length > 0 && entityData.razon_social) {
          await createEntity(businessId, entityData);
          successCount++;
        } else {
          errorCount++;
        }
      } catch (err) {
        console.error(`Error importing row ${i}:`, err);
        errorCount++;
      }
      setProgress(Math.round(((i + 1) / dataToImport.length) * 100));
    }

    setLoading(false);
    onImportSuccess(successCount, errorCount);
    onClose();
  };

  const resetModal = () => {
    setFile(null);
    setStep(1);
    setError(null);
    setImportResult(null);
    setProgress(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Importar {entityName} desde Excel</h2>
          <button onClick={resetModal} className="text-gray-500 hover:bg-gray-100 p-1 rounded-md transition-colors">
            <X size={20} />
          </button>
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
                <p className="text-gray-600 mb-2">Selecciona un archivo Excel (.xlsx o .xls) con la lista de {entityName.toLowerCase()}.</p>
                <p className="text-sm text-gray-500 mb-4">El sistema detectará automáticamente columnas como "Razón Social", "CUIT", "Domicilio", etc.</p>
              </div>
              
              <div className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <input
                  type="file"
                  id="excel-upload"
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
                <label 
                  htmlFor="excel-upload"
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

              <div className="w-full bg-gray-50 p-4 rounded-md text-sm text-gray-600 mt-4 border">
                <p className="font-semibold mb-2">Plantilla Recomendada:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Razón Social (Obligatorio)</li>
                  <li>CUIT/CUIL / Documento (Obligatorio)</li>
                  <li>Correo Electrónico</li>
                  <li>WhatsApp / Teléfono</li>
                  <li>Domicilio</li>
                </ul>
              </div>
            </div>
          )}

          {step === 2 && importResult && (
            <div className="space-y-6">
              <div className="bg-green-50 text-green-700 p-4 rounded-md flex items-start">
                <Check className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Archivo Analizado con Éxito</h3>
                  <p className="text-sm mt-1">
                    Se encontraron {importResult.total_filas} filas. Revisa el mapeo automático de columnas antes de importar.
                  </p>
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <div className="bg-gray-50 p-3 font-medium border-b flex justify-between">
                  <span>Columna en tu Excel</span>
                  <span>Mapeado al Sistema</span>
                </div>
                <div className="divide-y max-h-[300px] overflow-y-auto">
                  {Object.entries(importResult.mapeo_automatico).map(([excelCol, systemField]) => (
                    <div key={excelCol} className="p-3 flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">{excelCol}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-semibold">
                        {systemField}
                      </span>
                    </div>
                  ))}
                  {Object.keys(importResult.mapeo_automatico).length === 0 && (
                    <div className="p-4 text-center text-red-500 text-sm">
                      No se detectaron columnas compatibles automáticamente.
                    </div>
                  )}
                </div>
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
              <p className="text-gray-500 font-medium">{progress}% Completado</p>
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
              {loading ? 'Analizando...' : 'Analizar Archivo'}
            </Button>
          )}

          {step === 2 && (
            <Button 
              onClick={handleImport} 
              disabled={loading || Object.keys(importResult.mapeo_automatico).length === 0}
            >
              {loading ? 'Preparando...' : 'Iniciar Importación'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelImportModal;
