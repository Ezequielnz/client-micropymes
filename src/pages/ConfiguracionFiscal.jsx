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
  Server,
  Key
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
    ambiente: 'produccion',
    habilitada: true
  });

  const [certificadoFile, setCertificadoFile] = useState(null);
  const [clavePrivadaFile, setClavePrivadaFile] = useState(null);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
        ambiente: 'produccion',
        habilitada: config.habilitada !== undefined ? config.habilitada : false
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
      setErrorMessage(error.response?.data?.detail || 'Error en la conexión a ARCA.');
      setSuccessMessage('');
    }
  });

  const generarCsrMutation = useMutation({
    mutationFn: async (data) => facturacionAPI.generarCsr(businessId, data),
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'CSR generado correctamente.');
      setErrorMessage('');

      // Download the CSR file
      const blob = new Blob([data.csr_content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solicitud_${formData.cuit || 'afip'}.csr`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      queryClient.invalidateQueries(['facturacionConfig', businessId]);
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.detail || 'Error al generar el CSR.');
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

  const handleGenerarCsr = () => {
    if (!formData.cuit || !formData.razon_social) {
      setErrorMessage('CUIT y Razón Social son requeridos para generar el CSR. Llénalos en la sección de arriba.');
      return;
    }

    if (config?.key_path || config?.cert_path) {
      const confirmMsg = 'Ya tienes un certificado o clave generados. Si generas uno nuevo, se eliminarán los archivos actuales y el sistema dejará de conectarse a AFIP hasta que subas el nuevo certificado (.crt) que obtengas.\n\n¿Estás seguro de que deseas eliminar la configuración actual y generar una nueva solicitud?';
      if (!window.confirm(confirmMsg)) {
        return;
      }
    }

    setSuccessMessage('');
    setErrorMessage('');
    generarCsrMutation.mutate({ cuit: formData.cuit, razon_social: formData.razon_social });
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
            Configuración Fiscal (ARCA)
          </h1>
          <p className="text-gray-600 mt-1">
            Configura los datos y certificados para emitir facturas electrónicas a través de ARCA.
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condición Fiscal</label>
                <select
                  name="condicion_fiscal"
                  value={formData.condicion_fiscal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                >
                  <option value="monotributista" className="bg-white text-black">Monotributista</option>
                  <option value="responsable_inscripto" className="bg-white text-black">Responsable Inscripto</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">El número de punto de venta configurado en ARCA para WS.</p>
              </div>
            </div>
            
            <div className="mt-6 flex items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
              <input
                type="checkbox"
                id="habilitada"
                name="habilitada"
                checked={formData.habilitada}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <div className="ml-3">
                <label htmlFor="habilitada" className="block text-sm font-medium text-gray-900 cursor-pointer">
                  Habilitar facturación electrónica con ARCA
                </label>
                <p className="text-xs text-gray-500 mt-0.5">Si marcas esta opción, el sistema enviará automáticamente las facturas a ARCA al registrar una venta.</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Certificados Digitales</h2>
              <button
                type="button"
                onClick={handleGenerarCsr}
                disabled={generarCsrMutation.isPending || !formData.cuit || !formData.razon_social}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {generarCsrMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                Generar Solicitud (CSR)
              </button>
            </div>

            <details className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6 group text-sm text-gray-700">
              <summary className="font-semibold text-blue-900 mb-0 cursor-pointer flex items-center justify-between outline-none list-none">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Guía detallada para configurar la facturación (ARCA/AFIP)
                </span>
                <span className="transition-transform group-open:rotate-180">
                  <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M19 9l-7 7-7-7"></path></svg>
                </span>
              </summary>
              
              <div className="mt-5 space-y-5 text-gray-600">
                <p className="text-sm">Para facturar con ARCA (ex AFIP) de manera automática, necesitas seguir estos pasos con tu Clave Fiscal:</p>
                
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2"><span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span> Crear Punto de Venta</h4>
                  <p className="pl-7">Ingresa al servicio <strong>"Administración de puntos de venta y domicilios"</strong> en la web de ARCA.</p>
                  <p className="pl-7">Agrega un nuevo punto de venta. En "Sistema", debes elegir la opción que indique <strong>"Factura Electrónica - Web Service"</strong> o similar. Anota el número de este punto de venta e ingrésalo en la configuración de arriba.</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2"><span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span> Generar el CSR y crear el Computador Fiscal</h4>
                  <p className="pl-7">Haz clic en el botón <strong>"Generar Solicitud (CSR)"</strong> aquí arriba para descargar el archivo <code>.csr</code>. La clave privada se guardará automáticamente de forma segura.</p>
                  <p className="pl-7">En ARCA, ingresa al servicio <strong>"Administración de Certificados Digitales"</strong>.</p>
                  <p className="pl-7">Haz clic en "Agregar alias", elige un nombre para tu Computador Fiscal (por ejemplo, "MiSistemaPOS") y sube el archivo <code>.csr</code> que acabas de descargar.</p>
                  <p className="pl-7">Una vez creado, haz clic en "Ver" o "Descargar" para obtener el certificado (archivo <code>.crt</code>).</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2"><span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span> Delegar el Servicio (Administrador de Relaciones)</h4>
                  <p className="pl-7">En ARCA, ingresa al servicio <strong>"Administrador de Relaciones de Clave Fiscal"</strong>.</p>
                  <p className="pl-7">Haz clic en "Nueva Relación". En "Servicio", busca AFIP &gt; WebServices y selecciona <strong>"Facturación Electrónica" (wsfe)</strong>.</p>
                  <p className="pl-7">En "Representante", haz clic en "Buscar" e ingresa el nombre de tu Computador Fiscal (el alias que creaste en el paso 2).</p>
                  <p className="pl-7">Confirma la delegación. <strong>¡Importante!</strong> Este paso es obligatorio para que tu certificado tenga permisos para emitir facturas.</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2"><span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span> Subir el Certificado (.crt)</h4>
                  <p className="pl-7">Sube el archivo <code>.crt</code> que descargaste en el paso 2 en la sección "Certificado (.crt)" aquí abajo y haz clic en <strong>"Guardar Configuración"</strong>.</p>
                </div>
              </div>
            </details>

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
                        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Certificado actual guardado.
                        </p>
                      )}
                    </div>
                    <input type="file" className="hidden" accept=".crt,.pem" onChange={(e) => handleFileChange(e, setCertificadoFile)} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clave Privada</label>
                <div className="h-32 border-2 border-gray-200 rounded-lg bg-white flex flex-col items-center justify-center p-4">
                  {config?.key_path ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                      <p className="text-sm text-green-700 font-medium text-center">Clave Privada generada y guardada correctamente.</p>
                      <p className="text-xs text-gray-500 text-center mt-1">El sistema administra esta clave de forma segura.</p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-8 h-8 text-yellow-500 mb-2" />
                      <p className="text-sm text-gray-600 text-center">Aún no hay Clave Privada configurada.</p>
                      <p className="text-xs text-gray-500 text-center mt-1">Usa el botón "Generar Solicitud" para crear una automáticamente.</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium bg-transparent border-0 p-0 shadow-none hover:bg-transparent focus:ring-0 focus:outline-none"
              >
                {showAdvanced ? 'Ocultar Opciones Avanzadas' : 'Mostrar Opciones Avanzadas'}
              </button>

              {showAdvanced && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subir Clave Privada Manualmente (.key)</label>
                  <p className="text-xs text-gray-500 mb-2">Solo utiliza esta opción si ya tienes una clave privada generada previamente y no quieres generar una nueva.</p>
                  <div className="flex items-center justify-center w-full md:w-1/2">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-3 pb-4">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500 text-center px-4">
                          <span className="font-semibold">Click para subir</span>
                        </p>
                        {clavePrivadaFile && (
                          <p className="text-xs text-green-600 mt-1 font-medium truncate max-w-[200px]">
                            {clavePrivadaFile.name}
                          </p>
                        )}
                      </div>
                      <input type="file" className="hidden" accept=".key,.pem" onChange={(e) => handleFileChange(e, setClavePrivadaFile)} />
                    </label>
                  </div>
                </div>
              )}
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
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${testResult.app_server === 'OK' && testResult.db_server === 'OK' && testResult.auth_server === 'OK'
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
                  <p><span className="font-medium text-gray-700">Entorno ARCA:</span> {testResult.entorno_afip}</p>
                  <p><span className="font-medium text-gray-700">Comprobante Configurado:</span> Factura {testResult.tipo_comprobante_default}</p>
                  {testResult.ultimo_comprobante_autorizado !== undefined && (
                    <p><span className="font-medium text-gray-700">Último Comprobante (ARCA):</span> {testResult.ultimo_comprobante_autorizado}</p>
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
    <Layout activeSection="billing">
      <ConfiguracionFiscalContent />
    </Layout>
  );
}
