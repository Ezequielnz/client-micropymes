import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useBusinessContext } from '../contexts/BusinessContext';
import { businessAPI } from '../utils/api';

const INVENTORY_OPTIONS = [
  {
    value: 'por_sucursal',
    label: 'Por sucursal',
    description: 'Cada sucursal mantiene su propio stock independiente.',
  },
  {
    value: 'centralizado',
    label: 'Centralizado',
    description: 'El stock se gestiona a nivel negocio y se replica en todas las sucursales.',
  },
];

const SERVICE_OPTIONS = [
  { value: 'por_sucursal', label: 'Por sucursal' },
  { value: 'centralizado', label: 'Centralizado' },
];

const CATALOG_OPTIONS = [
  { value: 'por_sucursal', label: 'Por sucursal' },
  { value: 'compartido', label: 'Compartido' },
];

const INITIAL_BRANCH_FORM = {
  nombre: '',
  codigo: '',
  direccion: '',
  is_main: false,
};

const BranchPreferences = () => {
  const {
    currentBusiness,
    branches,
    branchSettings,
    branchSettingsLoading,
    branchSettingsError,
    refreshBranchSettings,
    refreshBranches,
  } = useBusinessContext();

  const [formState, setFormState] = useState({
    inventario_modo: 'por_sucursal',
    servicios_modo: 'por_sucursal',
    catalogo_producto_modo: 'por_sucursal',
    permite_transferencias: true,
    transferencia_auto_confirma: false,
  });
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [preferencesMessage, setPreferencesMessage] = useState('');
  const [preferencesError, setPreferencesError] = useState('');

  const [branchForm, setBranchForm] = useState(INITIAL_BRANCH_FORM);
  const [creatingBranch, setCreatingBranch] = useState(false);
  const [branchActionMessage, setBranchActionMessage] = useState('');
  const [branchActionError, setBranchActionError] = useState('');
  const [updatingBranchId, setUpdatingBranchId] = useState(null);

  useEffect(() => {
    if (branchSettings) {
      setFormState({
        inventario_modo: branchSettings.inventario_modo,
        servicios_modo: branchSettings.servicios_modo,
        catalogo_producto_modo: branchSettings.catalogo_producto_modo,
        permite_transferencias: branchSettings.permite_transferencias,
        transferencia_auto_confirma: branchSettings.transferencia_auto_confirma,
      });
    }
  }, [branchSettings]);

  useEffect(() => {
    setPreferencesMessage('');
    setPreferencesError('');
  }, [currentBusiness?.id]);

  const handleSelectChange = (field) => (event) => {
    const value = event.target.value;
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (field) => (event) => {
    const checked = event.target.checked;
    setFormState((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handlePreferencesSubmit = async (event) => {
    event.preventDefault();
    if (!currentBusiness?.id) {
      setPreferencesError('Selecciona un negocio para modificar sus preferencias.');
      return;
    }

    setSavingPreferences(true);
    setPreferencesError('');
    setPreferencesMessage('');
    try {
      await businessAPI.updateBranchSettings(currentBusiness.id, formState);
      await refreshBranchSettings(currentBusiness.id);
      setPreferencesMessage('Preferencias actualizadas correctamente.');
    } catch (error) {
      const detail = error?.response?.data?.detail || error.message || 'No se pudo guardar el cambio.';
      setPreferencesError(detail);
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleBranchFormChange = (field) => (event) => {
    const value = field === 'is_main' ? event.target.checked : event.target.value;
    setBranchForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateBranch = async (event) => {
    event.preventDefault();
    if (!currentBusiness?.id) {
      setBranchActionError('Selecciona un negocio antes de crear una sucursal.');
      return;
    }

    if (!branchForm.nombre.trim()) {
      setBranchActionError('El nombre de la sucursal es obligatorio.');
      return;
    }

    setCreatingBranch(true);
    setBranchActionError('');
    setBranchActionMessage('');
    try {
      await businessAPI.createBranch(currentBusiness.id, {
        ...branchForm,
        activo: true,
      });
      await refreshBranches(currentBusiness.id);
      await refreshBranchSettings(currentBusiness.id);
      setBranchForm(INITIAL_BRANCH_FORM);
      setBranchActionMessage('Sucursal creada correctamente.');
    } catch (error) {
      const detail = error?.response?.data?.detail || error.message || 'No se pudo crear la sucursal.';
      setBranchActionError(detail);
    } finally {
      setCreatingBranch(false);
    }
  };

  const handleToggleBranchActive = async (branch) => {
    if (!currentBusiness?.id) {
      setBranchActionError('Selecciona un negocio para gestionar sus sucursales.');
      return;
    }

    setUpdatingBranchId(branch.id);
    setBranchActionError('');
    setBranchActionMessage('');
    try {
      await businessAPI.updateBranch(currentBusiness.id, branch.id, {
        activo: !branch.activo,
      });
      await refreshBranches(currentBusiness.id);
      setBranchActionMessage(
        !branch.activo
          ? `Sucursal ${branch.nombre} activada.`
          : `Sucursal ${branch.nombre} desactivada.`
      );
    } catch (error) {
      const detail = error?.response?.data?.detail || error.message || 'No se pudo actualizar la sucursal.';
      setBranchActionError(detail);
    } finally {
      setUpdatingBranchId(null);
    }
  };

  const hasBusinessSelected = Boolean(currentBusiness?.id);

  const sortedBranches = useMemo(() => {
    if (!Array.isArray(branches)) {
      return [];
    }
    return [...branches].sort((a, b) => {
      if (a.is_main && !b.is_main) return -1;
      if (!a.is_main && b.is_main) return 1;
      return (a.nombre || '').localeCompare(b.nombre || '');
    });
  }, [branches]);

  return (
    <Layout activeSection="settings">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Configuración por negocio</h1>
          <p className="mt-2 text-slate-600">
            Define cómo se gestionan las sucursales, el inventario y los servicios del negocio seleccionado.
          </p>
          {currentBusiness ? (
            <p className="mt-1 text-sm text-slate-500">
              Negocio activo: <span className="font-medium">{currentBusiness.nombre}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-amber-600">
              Selecciona un negocio desde el encabezado para comenzar.
            </p>
          )}
        </header>

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Preferencias de operación</h2>
              <p className="text-sm text-slate-500">
                Estos ajustes impactan cómo se comportan el inventario, los servicios y el catálogo en todas las sucursales.
              </p>
            </div>
          </div>

          {branchSettingsLoading && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 mb-4">
              Cargando configuración del negocio...
            </div>
          )}

          {branchSettingsError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 mb-4">
              {branchSettingsError}
            </div>
          )}

          {preferencesMessage && (
            <div className="p-3 mb-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700">
              {preferencesMessage}
            </div>
          )}

          {preferencesError && (
            <div className="p-3 mb-4 bg-red-50 border border-red-100 rounded-lg text-red-700">
              {preferencesError}
            </div>
          )}

          <form onSubmit={handlePreferencesSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Modo de inventario
              </label>
              <select
                value={formState.inventario_modo}
                onChange={handleSelectChange('inventario_modo')}
                disabled={!hasBusinessSelected || branchSettingsLoading}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {INVENTORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                {
                  INVENTORY_OPTIONS.find(({ value }) => value === formState.inventario_modo)?.description
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Modo de servicios
                </label>
                <select
                  value={formState.servicios_modo}
                  onChange={handleSelectChange('servicios_modo')}
                  disabled={!hasBusinessSelected || branchSettingsLoading}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Catálogo de productos
                </label>
                <select
                  value={formState.catalogo_producto_modo}
                  onChange={handleSelectChange('catalogo_producto_modo')}
                  disabled={!hasBusinessSelected || branchSettingsLoading}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATALOG_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-start gap-3 border border-slate-200 rounded-lg p-4">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded"
                  checked={formState.permite_transferencias}
                  onChange={handleCheckboxChange('permite_transferencias')}
                  disabled={!hasBusinessSelected || branchSettingsLoading}
                />
                <span>
                  <span className="font-medium text-slate-800 block">Permitir transferencias de stock</span>
                  <span className="text-sm text-slate-500">
                    Habilita la creación y confirmación de transferencias entre sucursales.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 border border-slate-200 rounded-lg p-4">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded"
                  checked={formState.transferencia_auto_confirma}
                  onChange={handleCheckboxChange('transferencia_auto_confirma')}
                  disabled={
                    !hasBusinessSelected ||
                    branchSettingsLoading ||
                    !formState.permite_transferencias
                  }
                />
                <span>
                  <span className="font-medium text-slate-800 block">Confirmar transferencias automáticamente</span>
                  <span className="text-sm text-slate-500">
                    Cuando está activo, las transferencias se marcan como confirmadas sin intervención manual.
                  </span>
                </span>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!hasBusinessSelected || branchSettingsLoading || savingPreferences}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingPreferences ? 'Guardando...' : 'Guardar preferencias'}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Sucursales del negocio</h2>
              <p className="text-sm text-slate-500">
                Gestiona las sedes del negocio y agrega nuevas cuando lo necesites.
              </p>
            </div>
          </div>

          {branchActionMessage && (
            <div className="p-3 mb-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700">
              {branchActionMessage}
            </div>
          )}

          {branchActionError && (
            <div className="p-3 mb-4 bg-red-50 border border-red-100 rounded-lg text-red-700">
              {branchActionError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form
              onSubmit={handleCreateBranch}
              className="border border-slate-200 rounded-lg p-4 bg-slate-50"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Crear nueva sucursal</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={branchForm.nombre}
                    onChange={handleBranchFormChange('nombre')}
                    disabled={!hasBusinessSelected || creatingBranch}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Sucursal Palermo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Código interno
                  </label>
                  <input
                    type="text"
                    value={branchForm.codigo}
                    onChange={handleBranchFormChange('codigo')}
                    disabled={!hasBusinessSelected || creatingBranch}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: PAL-01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Dirección
                  </label>
                  <textarea
                    value={branchForm.direccion}
                    onChange={handleBranchFormChange('direccion')}
                    disabled={!hasBusinessSelected || creatingBranch}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Dirección física de la sucursal"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={branchForm.is_main}
                    onChange={handleBranchFormChange('is_main')}
                    disabled={!hasBusinessSelected || creatingBranch}
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded"
                  />
                  Marcar como sucursal principal
                </label>

                <button
                  type="submit"
                  disabled={!hasBusinessSelected || creatingBranch}
                  className="w-full inline-flex justify-center items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creatingBranch ? 'Creando...' : 'Crear sucursal'}
                </button>
              </div>
            </form>

            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Sucursales registradas</h3>

              {!hasBusinessSelected ? (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-700">
                  Selecciona un negocio para ver sus sucursales.
                </div>
              ) : sortedBranches.length === 0 ? (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-700">
                  Aún no se registraron sucursales adicionales para este negocio.
                </div>
              ) : (
                <ul className="space-y-3">
                  {sortedBranches.map((branch) => (
                    <li
                      key={branch.id}
                      className="border border-slate-200 rounded-lg px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {branch.nombre}{' '}
                          {branch.is_main && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full">
                              Principal
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-slate-500">
                          Código: {branch.codigo || '—'} • Estado:{' '}
                          {branch.activo ? (
                            <span className="text-emerald-600 font-medium">Activa</span>
                          ) : (
                            <span className="text-slate-500 font-medium">Inactiva</span>
                          )}
                        </p>
                        {branch.direccion && (
                          <p className="text-sm text-slate-500">Dirección: {branch.direccion}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleBranchActive(branch)}
                          disabled={updatingBranchId === branch.id}
                          className="inline-flex items-center px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {updatingBranchId === branch.id
                            ? 'Actualizando...'
                            : branch.activo
                            ? 'Desactivar'
                            : 'Reactivar'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default BranchPreferences;
