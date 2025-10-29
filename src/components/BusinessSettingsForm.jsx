import React, { useState, useEffect, useCallback } from 'react';
import { businessAPI } from '../utils/api';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';

const BusinessSettingsForm = ({ business, isOpen, onClose, onSave }) => {
  const [settings, setSettings] = useState({
    locale: 'es-AR',
    timezone: 'America/Argentina/Buenos_Aires',
    currency: 'ARS',
    sales_drop_threshold: 15,
    min_days_for_model: 30
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Opciones predefinidas
  const localeOptions = [
    { value: 'es-AR', label: 'Español (Argentina)' },
    { value: 'es-ES', label: 'Español (España)' },
    { value: 'es-MX', label: 'Español (México)' },
    { value: 'es-CL', label: 'Español (Chile)' },
    { value: 'es-CO', label: 'Español (Colombia)' },
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'English (US)' }
  ];

  const timezoneOptions = [
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (UTC-3)' },
    { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
    { value: 'America/Santiago', label: 'Santiago (UTC-3)' },
    { value: 'America/Bogota', label: 'Bogotá (UTC-5)' },
    { value: 'America/Mexico_City', label: 'Ciudad de México (UTC-6)' },
    { value: 'Europe/Madrid', label: 'Madrid (UTC+1)' },
    { value: 'America/New_York', label: 'New York (UTC-5)' }
  ];

  const currencyOptions = [
    { value: 'ARS', label: 'Peso Argentino (ARS)' },
    { value: 'USD', label: 'Dólar Estadounidense (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'BRL', label: 'Real Brasileño (BRL)' },
    { value: 'CLP', label: 'Peso Chileno (CLP)' },
    { value: 'COP', label: 'Peso Colombiano (COP)' },
    { value: 'MXN', label: 'Peso Mexicano (MXN)' }
  ];

  // Opciones de sensibilidad y días mínimos
  const sensitivityOptions = [
    { value: 30, label: 'Baja (30%)' },
    { value: 15, label: 'Media (15%)' },
    { value: 10, label: 'Alta (10%)' }
  ];

  const minDaysOptions = [
    { value: 15, label: '15 días' },
    { value: 30, label: '30 días' },
    { value: 60, label: '60 días' },
    { value: 90, label: '90 días' }
  ];

  const loadSettings = useCallback(async () => {
    if (!business?.id) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      
      // Intentar cargar configuración existente
      const response = await businessAPI.getTenantSettings(business.id);
      if (response && Object.keys(response).length > 0) {
        setSettings(prev => ({
          ...prev,
          ...response
        }));
      }
    } catch (err) {
      console.warn('No hay configuración previa, usando valores por defecto', err);
      // Si no existe configuración, usar valores por defecto
    } finally {
      setLoading(false);
    }
  }, [business?.id]);

  useEffect(() => {
    if (isOpen && business) {
      loadSettings();
    }
  }, [isOpen, business, loadSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validaciones
      if (settings.sales_drop_threshold < 1 || settings.sales_drop_threshold > 100) {
        throw new Error('El umbral de alertas debe estar entre 1% y 100%');
      }
      
      if (settings.min_days_for_model < 7 || settings.min_days_for_model > 365) {
        throw new Error('Los días mínimos deben estar entre 7 y 365');
      }

      await businessAPI.saveTenantSettings(business.id, settings);
      onSave?.();
      onClose();
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-black">Configuración de negocio</h2>
            <p className="text-sm text-gray-600 mt-1">{business?.nombre}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Cargando configuración...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {/* Idioma y región */}
              <div>
                <h3 className="text-lg font-medium text-black mb-2">Idioma y región</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona el idioma y la zona horaria de tu negocio para que los reportes se muestren correctamente.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Idioma
                    </label>
                    <select
                      value={settings.locale}
                      onChange={(e) => handleInputChange('locale', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    >
                      {localeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Zona horaria
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    >
                      {timezoneOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Moneda */}
              <div>
                <h3 className="text-lg font-medium text-black mb-2">Moneda predeterminada</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Define en qué moneda se expresarán tus ventas y reportes.
                </p>
                
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-black mb-2">
                    Moneda
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  >
                    {currencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Alertas de ventas */}
              <div>
                <h3 className="text-lg font-medium text-black mb-2">Sensibilidad de alertas de ventas</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Este valor define cuánto deben caer tus ventas para que el sistema te avise.<br />
                  <strong className="text-black">Ejemplo:</strong> con 15%, recibirás una alerta si tus ventas bajan más de un 15% respecto a lo esperado.
                </p>
                
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-black mb-2">
                    Sensibilidad de alerta
                  </label>
                  <select
                    value={settings.sales_drop_threshold}
                    onChange={(e) => handleInputChange('sales_drop_threshold', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  >
                    {sensitivityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Baja: alerta con caídas mayores al 30% | Media: 15% | Alta: 10%
                  </p>
                </div>
              </div>

              {/* Días para predicciones */}
              <div>
                <h3 className="text-lg font-medium text-black mb-2">Mínimo de días de datos para predicciones</h3>
                <p className="text-sm text-gray-600 mb-4">
                  El sistema necesita datos históricos para aprender el comportamiento de tu negocio.<br />
                  Este valor define a partir de cuántos días acumulados se activan las predicciones y alertas.
                </p>
                
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-black mb-2">
                    Días mínimos
                  </label>
                  <select
                    value={settings.min_days_for_model}
                    onChange={(e) => handleInputChange('min_days_for_model', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  >
                    {minDaysOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Opciones disponibles: 15, 30, 60 o 90 días
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar configuración
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettingsForm;
