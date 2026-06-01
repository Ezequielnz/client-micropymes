import React, { useState, useEffect } from 'react';
import { useBusinessContext } from '../contexts/BusinessContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facturacionAPI } from '../utils/api';
import PermissionGuard from '../components/PermissionGuard';
import Layout from '../components/Layout';
import {
  FileText,
  Save,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Upload,
  RefreshCw,
  Server
} from 'lucide-react';

const Alert = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  return (
    <div className={`border rounded-lg p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export function ConfiguracionFiscalContent() {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    cuit: '',
    razon_social: '',
    punto_venta: 1,
    condicion_fiscal: 'monotributista',
    ambiente: 'homologacion',
    habilitada: false
  });

  const [certificadoFile, setCertificadoFile] = useState(null);
  const [clavePrivadaFile, setClavePrivadaFile] = useState(null);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [testResult, setTestResult] = useState(null);

  const { data: config, isLoading, isError } = useQuery({
    queryKey: ['facturacionConfig', businessId],
    queryFn: () => facturacionAPI.getConfig(businessId),
    enabled: !!businessId,
    retry: false, // It might be 404 if not configured yet
  });

  useEffect(() => {
    if (config) {
      setFormData({
        cuit: config.cuit || '',
        razon_social: config.razon_social || '',
        punto_venta: config.punto_venta || 1,
        condicion_fiscal: config.condicion_fiscal || 'monotributista',
        ambiente: config.ambiente || 'homologacion',
        habilitada: config.habilitada || false
      });
    }
  }, [config]);

  const saveConfigMutation = useMutation({
    mutationFn: async (data) => {
      const form = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          form.append(key, data[key]);
        }
      });
      if (certificadoFile) form.append('certificado', certificadoFile);
      if (clavePrivadaFile) form.append('clave_privada', clavePrivadaFile);
      
      return await facturacionAPI.upsertConfig(businessId, form);
    },
    onSuccess: () => {
      setSuccessMessage('Configuración fiscal guardada correctamente.');
      setErrorMessage('');
      setCertificadoFile(null);
      setClavePrivadaFile(null);
      queryClient.invalidateQueries(['facturacionConfig', businessId]);
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.detail || 'Error al guardar la configuración.');
      setSuccessMessage('');
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: () => facturacionAPI.getStatus(businessId),
    onSuccess: (data) => {
      setTestResult(data);
      setErrorMessage('');
      setSuccessMessage('Prueba de conexión realizada.');
    },
    onError: (error) => {
      setTestResult(null);
      setErrorMessage(error.response?.data?.detail || 'Error en la conexión a AFIP.');
      setSuccessMessage('');
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setTestResult(null);
    saveConfigMutation.mutate(formData);
  };

  const handleTestConnection = () => {
    setSuccessMessage('');
    setErrorMessage('');
    setTestResult(null);
    testConnectionMutation.mutate();
  };

  if (!businessId) {
    return (
      <div className="px-4 py-8 max-w-4xl mx-auto">
        <Alert variant="warning">No hay negocio seleccionado.</Alert>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Configuración Fiscal (AFIP)
          </h1>
          <p className="text-gray-600 mt-1">
            Configura los datos y certificados para emitir facturas electrónicas a través de AFIP.
          </p>
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="mb-6 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div>
              <h3 className="font-semibold">Error</h3>
              <p>{errorMessage}</p>
            </div>
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" className="mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>{successMessage}</span>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del Emisor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CUIT</label>
                <input
                  type="text"
                  name="cuit"
                  value={formData.cuit}
                  onChange={handleInputChange}
                  placeholder="Sin guiones"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                <input
                  type="text"
                  name="razon_social"
                  value={formData.razon_social}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condición Fiscal</label>
                <select
                  name="condicion_fiscal"
                  value={formData.condicion_fiscal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="monotributista">Monotributista</option>
                  <option value="responsable_inscripto">Responsable Inscripto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Punto de Venta</label>
                <input
                  type="number"
                  name="punto_venta"
                  value={formData.punto_venta}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">El número de punto de venta configurado en AFIP para WS.</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Certificados Digitales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificado (.crt)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 text-center px-4">
                        <span className="font-semibold">Click para subir</span> o arrastrar y soltar
                      </p>
                      {certificadoFile && (
                        <p className="text-sm text-green-600 mt-2 font-medium truncate max-w-[200px]">
                          {certificadoFile.name}
                        </p>
                      )}
                      {!certificadoFile && config?.cert_path && (
                        <p className="text-xs text-blue-600 mt-2">Certificado actual guardado.</p>
                      )}
                    </div>
                    <input type="file" className="hidden" accept=".crt,.pem" onChange={(e) => handleFileChange(e, setCertificadoFile)} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clave Privada (.key)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 text-center px-4">
                        <span className="font-semibold">Click para subir</span> o arrastrar y soltar
                      </p>
                      {clavePrivadaFile && (
                        <p className="text-sm text-green-600 mt-2 font-medium truncate max-w-[200px]">
                          {clavePrivadaFile.name}
                        </p>
                      )}
                      {!clavePrivadaFile && config?.key_path && (
                        <p className="text-xs text-blue-600 mt-2">Clave privada actual guardada.</p>
                      )}
                    </div>
                    <input type="file" className="hidden" accept=".key,.pem" onChange={(e) => handleFileChange(e, setClavePrivadaFile)} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Entorno y Habilitación</h2>
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="habilitada"
                  checked={formData.habilitada}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="block text-sm font-medium text-gray-900">Habilitar Facturación Automática</span>
                  <span className="block text-sm text-gray-500">Al habilitar, el POS mostrará la opción para emitir comprobante oficial.</span>
                </div>
              </label>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Entorno Operativo</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ambiente"
                      value="homologacion"
                      checked={formData.ambiente === 'homologacion'}
                      onChange={handleInputChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">Homologación (Pruebas)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ambiente"
                      value="produccion"
                      checked={formData.ambiente === 'produccion'}
                      onChange={handleInputChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 font-medium text-red-600">Producción (Real)</span>
                  </label>
                </div>
                {formData.ambiente === 'produccion' && (
                  <p className="text-xs text-red-600 mt-2 font-medium">
                    ¡Atención! Las facturas emitidas en producción tienen validez legal.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testConnectionMutation.isPending || saveConfigMutation.isPending || !config}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {testConnectionMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Probar Conexión
            </button>
            <button
              type="submit"
              disabled={saveConfigMutation.isPending || isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {saveConfigMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar Configuración
            </button>
          </div>
        </form>

        {testResult && (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Server className="h-5 w-5 text-gray-500" />
                Resultado de Conexión
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                testResult.app_server === 'OK' && testResult.db_server === 'OK' && testResult.auth_server === 'OK'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {testResult.app_server === 'OK' && testResult.db_server === 'OK' && testResult.auth_server === 'OK' ? 'Conectado' : 'Con Problemas'}
              </span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-sm text-gray-500 mb-1">App Server</div>
                  <div className={`font-semibold ${testResult.app_server === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                    {testResult.app_server}
                  </div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-sm text-gray-500 mb-1">Database</div>
                  <div className={`font-semibold ${testResult.db_server === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                    {testResult.db_server}
                  </div>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <div className="text-sm text-gray-500 mb-1">Auth Server</div>
                  <div className={`font-semibold ${testResult.auth_server === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                    {testResult.auth_server}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Detalles Adicionales</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-700">Entorno AFIP:</span> {testResult.entorno_afip}</p>
                  <p><span className="font-medium text-gray-700">Comprobante Configurado:</span> Factura {testResult.tipo_comprobante_default}</p>
                  {testResult.ultimo_comprobante_autorizado !== undefined && (
                    <p><span className="font-medium text-gray-700">Último Comprobante (AFIP):</span> {testResult.ultimo_comprobante_autorizado}</p>
                  )}
                  {testResult.error && (
                    <p className="text-red-600 font-medium">Error: {testResult.error}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function ConfiguracionFiscal() {
  return (
    <Layout activeSection="settings">
      <ConfiguracionFiscalContent />
    </Layout>
  );
}
