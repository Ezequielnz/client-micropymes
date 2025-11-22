import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { businessAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import {
  useBusinessesQuery,
  useBusinessBranchesQuery,
  useBusinessSettingsQuery,
  businessKeys,
} from '../hooks/useBusinesses';
import { 
  Building2, 
  Plus, 
  Package, 
  Users, 
  ShoppingCart,
  Loader2,
  User,
  Mail,
  Shield,
  ArrowLeft,
  Eye,
  Settings,
  MoreVertical,
  Calendar,
  Activity,
  Trash2,
  Edit,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Hash,
  Star,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';

// Componente Button simple sin dependencias externas
const SimpleButton = ({ children, onClick, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

// Componente Modal de confirmaciÃ³n
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, businessName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-3">{message}</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 font-medium">"{businessName}"</p>
            <p className="text-red-600 text-sm mt-1">
              Esta acciÃ³n eliminarÃ¡ permanentemente:
            </p>
            <ul className="text-red-600 text-sm mt-2 list-disc list-inside">
              <li>Todos los productos</li>
              <li>Todas las categorÃ­as</li>
              <li>Todos los clientes</li>
              <li>Todas las ventas</li>
              <li>Toda la configuraciÃ³n</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <SimpleButton 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
            disabled={isDeleting}
          >
            Cancelar
          </SimpleButton>
          <SimpleButton 
            variant="destructive" 
            onClick={onConfirm}
            className="flex-1"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </>
            )}
          </SimpleButton>
        </div>
      </div>
    </div>
  );
};

const extractErrorMessage = (error, fallback = 'OcurriÃ³ un error inesperado.') => {
  if (!error) {
    return fallback;
  }
  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return fallback;
};

const mapSettingsToFormState = (cfg) => ({
  inventario_modo: cfg?.inventario_modo || 'por_sucursal',
  servicios_modo: cfg?.servicios_modo || 'por_sucursal',
  catalogo_producto_modo: cfg?.catalogo_producto_modo || 'por_sucursal',
  permite_transferencias: cfg?.permite_transferencias ?? true,
  transferencia_auto_confirma: cfg?.transferencia_auto_confirma ?? false,
  default_branch_id: cfg?.default_branch_id ? String(cfg.default_branch_id) : '',
});

const BranchFormModal = ({
  isOpen,
  title,
  submitLabel,
  initialData,
  onClose,
  onSubmit,
  saving,
  error,
}) => {
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [codigo, setCodigo] = useState(initialData?.codigo || '');
  const [direccion, setDireccion] = useState(initialData?.direccion || '');
  const [activo, setActivo] = useState(initialData?.activo ?? true);
  const [isMain, setIsMain] = useState(initialData?.is_main ?? false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setNombre(initialData?.nombre || '');
      setCodigo(initialData?.codigo || '');
      setDireccion(initialData?.direccion || '');
      setActivo(initialData?.activo ?? true);
      setIsMain(initialData?.is_main ?? false);
      setLocalError(null);
    } else {
      setLocalError(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!nombre.trim()) {
      setLocalError('El nombre de la sucursal es obligatorio.');
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      codigo: codigo.trim(),
      direccion: direccion.trim(),
      activo,
      is_main: isMain,
    };

    try {
      await onSubmit(payload);
    } catch {
      // El manejador superior se encarga de mostrar el error.
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={saving}
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la sucursal
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900"
              placeholder="Ej. Sucursal Centro"
              disabled={saving}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CÃ³digo interno</label>
              <input
                type="text"
                value={codigo}
                onChange={(event) => setCodigo(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900"
                placeholder="Ej. CENTRO"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DirecciÃ³n</label>
              <input
                type="text"
                value={direccion}
                onChange={(event) => setDireccion(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900"
                placeholder="Calle, nÃºmero y ciudad"
                disabled={saving}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={activo}
                onChange={(event) => setActivo(event.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                disabled={saving}
              />
              La sucursal estÃ¡ activa
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isMain}
                onChange={(event) => setIsMain(event.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                disabled={saving}
              />
              Marcar como sucursal principal
            </label>
          </div>
          {(localError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
              {localError || error}
            </div>
          )}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3 gap-3">
            <SimpleButton
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
              disabled={saving}
            >
              Cancelar
            </SimpleButton>
            <SimpleButton
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {submitLabel}
                </>
              )}
            </SimpleButton>
          </div>
        </form>
      </div>
    </div>
  );
};

const BranchSettingsPanel = ({ branches, settings, saving, error, onSave }) => {
  const [formState, setFormState] = useState(() => mapSettingsToFormState(settings));
  const [dirty, setDirty] = useState(false);
  const settingsKey = settings ? `${settings.negocio_id}-${settings.updated_at}` : null;

  useEffect(() => {
    setFormState(mapSettingsToFormState(settings));
    setDirty(false);
  }, [settingsKey, settings]);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!settings) {
      return;
    }

    const payload = {};
    if (formState.inventario_modo !== settings.inventario_modo) {
      payload.inventario_modo = formState.inventario_modo;
    }
    if (formState.servicios_modo !== settings.servicios_modo) {
      payload.servicios_modo = formState.servicios_modo;
    }
    if (formState.catalogo_producto_modo !== settings.catalogo_producto_modo) {
      payload.catalogo_producto_modo = formState.catalogo_producto_modo;
    }
    if (formState.permite_transferencias !== settings.permite_transferencias) {
      payload.permite_transferencias = formState.permite_transferencias;
    }
    if (formState.transferencia_auto_confirma !== settings.transferencia_auto_confirma) {
      payload.transferencia_auto_confirma = formState.transferencia_auto_confirma;
    }

    const normalizedDefault = formState.default_branch_id ? formState.default_branch_id : null;
    const currentDefault = settings.default_branch_id ? String(settings.default_branch_id) : null;
    if (normalizedDefault !== currentDefault) {
      payload.default_branch_id = normalizedDefault;
    }

    if (Object.keys(payload).length === 0) {
      setDirty(false);
      return;
    }

    const success = await onSave(payload);
    if (success) {
      setDirty(false);
    }
  };

  const handleReset = (event) => {
    event.preventDefault();
    setFormState(mapSettingsToFormState(settings));
    setDirty(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modo de inventario
          </label>
          <select
            value={formState.inventario_modo}
            onChange={(event) => handleChange('inventario_modo', event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900"
            disabled={saving}
          >
            <option value="por_sucursal">Por sucursal (recomendado)</option>
            <option value="centralizado">Centralizado</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Controla si el stock se administra por sucursal o de forma unificada.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modo de servicios
          </label>
          <select
            value={formState.servicios_modo}
            onChange={(event) => handleChange('servicios_modo', event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900"
            disabled={saving}
          >
            <option value="por_sucursal">Configurar por sucursal</option>
            <option value="centralizado">Compartir entre todas las sucursales</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Establece si la oferta de servicios varÃ­a por ubicaciÃ³n.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CatÃ¡logo de productos
          </label>
          <select
            value={formState.catalogo_producto_modo}
            onChange={(event) => handleChange('catalogo_producto_modo', event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900"
            disabled={saving}
          >
            <option value="por_sucursal">Personalizado por sucursal</option>
            <option value="compartido">Compartido entre todas</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Define si cada sucursal puede manejar precios y visibilidad propios.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sucursal predeterminada
          </label>
          <select
            value={formState.default_branch_id}
            onChange={(event) => handleChange('default_branch_id', event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-900"
            disabled={saving || branches.length === 0}
          >
            <option value="">Seleccionar automÃ¡ticamente</option>
            {branches.map((branch) => (
              <option key={branch.id} value={String(branch.id)}>
                {branch.nombre} {branch.is_main ? '(Principal)' : ''}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Se utiliza como sucursal por defecto al crear nuevos registros.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formState.permite_transferencias}
              onChange={(event) => handleChange('permite_transferencias', event.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              disabled={saving}
            />
            Permitir transferencias entre sucursales
          </label>
          <label
            className={`flex items-center gap-2 text-sm ${
              formState.permite_transferencias ? 'text-gray-700' : 'text-gray-400'
            }`}
          >
            <input
              type="checkbox"
              checked={formState.transferencia_auto_confirma}
              onChange={(event) => handleChange('transferencia_auto_confirma', event.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              disabled={saving || !formState.permite_transferencias}
            />
            Confirmar transferencias automÃ¡ticamente
          </label>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-end">
          <SimpleButton
            type="button"
            variant="outline"
            onClick={handleReset}
            className="sm:w-auto"
            disabled={!dirty || saving}
          >
            Restablecer
          </SimpleButton>
          <SimpleButton
            type="submit"
            className="sm:w-auto bg-blue-600 hover:bg-blue-700"
            disabled={!dirty || saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Guardar cambios
              </>
            )}
          </SimpleButton>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      )}
    </form>
  );
};

const BranchManager = ({ business, canManage }) => {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchesError, setBranchesError] = useState(null);
  const [settings, setSettings] = useState(null);
  const [settingsError, setSettingsError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formError, setFormError] = useState(null);
  const [savingBranch, setSavingBranch] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [updatingBranchId, setUpdatingBranchId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const {
    data: branchesData,
    isFetching: branchesFetching,
    isError: branchesQueryHasError,
    error: branchesQueryError,
    refetch: refetchBranches,
    isSuccess: branchesQuerySuccess,
  } = useBusinessBranchesQuery(business.id, expanded);

  const {
    data: settingsData,
    isFetching: settingsFetching,
    isError: settingsQueryHasError,
    error: settingsQueryError,
    refetch: refetchSettings,
    isSuccess: settingsQuerySuccess,
  } = useBusinessSettingsQuery(business.id, expanded && canManage);

  const sortBranches = useCallback((list) => {
    return [...(list || [])].sort((a, b) => {
      const aScore = a.is_main ? 0 : 1;
      const bScore = b.is_main ? 0 : 1;
      if (aScore !== bScore) {
        return aScore - bScore;
      }
      const aName = (a.nombre || '').toLowerCase();
      const bName = (b.nombre || '').toLowerCase();
      if (aName < bName) return -1;
      if (aName > bName) return 1;
      return 0;
    });
  }, []);

  useEffect(() => {
    if (!expanded) {
      return;
    }
    if (branchesQuerySuccess) {
      setBranches(sortBranches(branchesData || []));
      setBranchesError(null);
    }
  }, [expanded, branchesQuerySuccess, branchesData, sortBranches]);

  useEffect(() => {
    if (!branchesQueryHasError || !branchesQueryError) {
      return;
    }
    setBranchesError(extractErrorMessage(branchesQueryError, 'No se pudieron cargar las sucursales.'));
  }, [branchesQueryHasError, branchesQueryError]);

  useEffect(() => {
    if (!expanded || !canManage) {
      return;
    }
    if (settingsQuerySuccess) {
      setSettings(settingsData ?? null);
      setSettingsError(null);
    }
  }, [expanded, canManage, settingsQuerySuccess, settingsData]);

  useEffect(() => {
    if (!settingsQueryHasError || !settingsQueryError) {
      return;
    }
    setSettings(null);
    setSettingsError(extractErrorMessage(settingsQueryError, 'No se pudo obtener la configuraciÃ³n del negocio.'));
  }, [settingsQueryHasError, settingsQueryError]);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      if (next) {
        setFeedbackMessage(null);
        setBranchesError(null);
        setSettingsError(null);
      }
      return next;
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setFeedbackMessage(null);
    setBranchesError(null);
    setSettingsError(null);
    refetchBranches();
    if (canManage) {
      refetchSettings();
    }
  }, [canManage, refetchBranches, refetchSettings]);

  const handleOpenCreate = useCallback(() => {
    setEditingBranch(null);
    setFormError(null);
    setFeedbackMessage(null);
    setShowFormModal(true);
  }, []);

  const handleEditBranch = useCallback((branch) => {
    setEditingBranch(branch);
    setFormError(null);
    setFeedbackMessage(null);
    setShowFormModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (!savingBranch) {
      setShowFormModal(false);
      setEditingBranch(null);
      setFormError(null);
    }
  }, [savingBranch]);

  const handleBranchSubmit = useCallback(
    async (values) => {
      setSavingBranch(true);
      setFormError(null);
      try {
        const payload = {
          nombre: values.nombre,
          codigo: values.codigo ? values.codigo : null,
          direccion: values.direccion ? values.direccion : null,
          activo: values.activo,
          is_main: values.is_main,
        };

        if (editingBranch) {
          await businessAPI.updateBranch(business.id, String(editingBranch.id), payload);
          setFeedbackMessage('Sucursal actualizada correctamente.');
        } else {
          await businessAPI.createBranch(business.id, payload);
          setFeedbackMessage('Sucursal creada correctamente.');
        }

        setShowFormModal(false);
        setEditingBranch(null);
        await queryClient.invalidateQueries({ queryKey: businessKeys.branches(business.id) });
      } catch (error) {
        setFormError(extractErrorMessage(error, 'No se pudo guardar la sucursal.'));
        throw error;
      } finally {
        setSavingBranch(false);
      }
    },
    [business.id, editingBranch, queryClient]
  );

  const handleToggleActive = useCallback(
    async (branch) => {
      const branchId = String(branch.id);
      setUpdatingBranchId(branchId);
      setBranchesError(null);
      setFeedbackMessage(null);
      try {
        await businessAPI.updateBranch(business.id, branchId, { activo: !branch.activo });
        await queryClient.invalidateQueries({ queryKey: businessKeys.branches(business.id) });
        setFeedbackMessage(
          branch.activo ? 'Sucursal desactivada correctamente.' : 'Sucursal activada correctamente.'
        );
      } catch (error) {
        setBranchesError(extractErrorMessage(error, 'No se pudo actualizar el estado de la sucursal.'));
      } finally {
        setUpdatingBranchId(null);
      }
    },
    [business.id, queryClient]
  );

  const handleSetMain = useCallback(
    async (branch) => {
      const branchId = String(branch.id);
      setUpdatingBranchId(branchId);
      setBranchesError(null);
      setFeedbackMessage(null);
      try {
        await businessAPI.updateBranch(business.id, branchId, { is_main: true });
        await queryClient.invalidateQueries({ queryKey: businessKeys.branches(business.id) });
        setFeedbackMessage('La sucursal principal se actualizÃ³ correctamente.');
      } catch (error) {
        setBranchesError(extractErrorMessage(error, 'No se pudo establecer la sucursal principal.'));
      } finally {
        setUpdatingBranchId(null);
      }
    },
    [business.id, queryClient]
  );

  const handleSaveSettings = useCallback(
    async (changes) => {
      setSavingSettings(true);
      setSettingsError(null);
      setFeedbackMessage(null);
      try {
        const updated = await businessAPI.updateBranchSettings(business.id, changes);
        setSettings(updated);
        setFeedbackMessage('La configuraciÃ³n del negocio se actualizÃ³ correctamente.');
        queryClient.setQueryData(businessKeys.settings(business.id), updated);
        return true;
      } catch (error) {
        setSettingsError(extractErrorMessage(error, 'No se pudieron guardar las preferencias.'));
        return false;
      } finally {
        setSavingSettings(false);
      }
    },
    [business.id, queryClient]
  );

  const branchesLoading = expanded && branchesFetching;
  const settingsLoading = canManage ? (expanded && settingsFetching) : false;
  const currentRole = (business.rol || '').toLowerCase();
  const canEditBranches = canManage;
  const hasBranches = branches.length > 0;

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between text-left text-gray-800 hover:text-blue-600"
      >
        <span className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span className="font-medium">
            Sucursales y configuraciÃ³n operativa
            <span className="block text-sm font-normal text-gray-500">
              {hasBranches ? `${branches.length} sucursal(es) registradas` : 'Sin sucursales registradas'}
            </span>
          </span>
        </span>
        <span className="flex items-center gap-2">
          {currentRole && (
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {currentRole}
            </span>
          )}
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </span>
      </button>

      {expanded && (
        <div className="mt-5 space-y-5">
          {feedbackMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {branchesError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
              {branchesError}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h4 className="text-base font-semibold text-gray-900">Listado de sucursales</h4>
              <p className="text-sm text-gray-500">
                Visualiza y administra las ubicaciones habilitadas para este negocio.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SimpleButton
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={branchesLoading || settingsLoading}
                className="text-gray-700 hover:text-blue-600"
              >
                {branchesLoading || settingsLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </>
                )}
              </SimpleButton>
              {canEditBranches && (
                <SimpleButton size="sm" onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva sucursal
                </SimpleButton>
              )}
            </div>
          </div>

          {branchesLoading && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando sucursales...</span>
            </div>
          )}

          {!branchesLoading && !hasBranches && (
            <div className="border border-dashed border-gray-300 rounded-lg px-5 py-8 text-center bg-white">
              <div className="flex items-center justify-center gap-2 text-gray-500 mb-3">
                <MapPin className="h-5 w-5" />
                <span>No se encontraron sucursales para este negocio.</span>
              </div>
              {canEditBranches && (
                <SimpleButton onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera sucursal
                </SimpleButton>
              )}
            </div>
          )}

          {!branchesLoading && hasBranches && (
            <div className="space-y-4">
              {branches.map((branch) => {
                const branchId = String(branch.id);
                const isUpdating = updatingBranchId === branchId;
                return (
                  <div
                    key={branchId}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-4 flex flex-col gap-3"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <h5 className="text-lg font-semibold text-gray-900">{branch.nombre}</h5>
                          {branch.is_main && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                              <Star className="h-3 w-3" />
                              Principal
                            </span>
                          )}
                          {!branch.activo && (
                            <span className="inline-flex items-center text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-full">
                              Inactiva
                            </span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          {branch.codigo && (
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4 text-gray-400" />
                              <span>{branch.codigo}</span>
                            </div>
                          )}
                          {branch.direccion && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{branch.direccion}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {canEditBranches && (
                        <div className="flex flex-wrap items-center gap-2">
                          <SimpleButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBranch(branch)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </SimpleButton>
                          <SimpleButton
                            variant={branch.activo ? 'outline' : 'success'}
                            size="sm"
                            onClick={() => handleToggleActive(branch)}
                            disabled={isUpdating}
                          >
                            {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <span>{branch.activo ? 'Desactivar' : 'Activar'}</span>
                          </SimpleButton>
                          {!branch.is_main && (
                            <SimpleButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetMain(branch)}
                              disabled={isUpdating}
                              className="text-gray-700 hover:text-blue-600"
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Star className="h-4 w-4 mr-2" />
                              )}
                              Hacer principal
                            </SimpleButton>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {canManage && (
            <div className="space-y-3">
              <div>
                <h4 className="text-base font-semibold text-gray-900">Preferencias del negocio</h4>
                <p className="text-sm text-gray-500">
                  Ajusta cÃ³mo operan las sucursales en inventario, servicios y transferencias.
                </p>
              </div>
              {settingsLoading && (
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cargando configuraciÃ³n...</span>
                </div>
              )}
              {!settingsLoading && settings && (
                <BranchSettingsPanel
                  branches={branches}
                  settings={settings}
                  saving={savingSettings}
                  error={settingsError}
                  onSave={handleSaveSettings}
                />
              )}
              {!settingsLoading && !settings && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
                  {settingsError || 'No se pudo cargar la configuraciÃ³n actual de este negocio.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showFormModal && (
        <BranchFormModal
          isOpen={showFormModal}
          title={editingBranch ? 'Editar sucursal' : 'Nueva sucursal'}
          submitLabel={editingBranch ? 'Guardar cambios' : 'Crear sucursal'}
          initialData={editingBranch}
          onClose={handleCloseModal}
          onSubmit={handleBranchSubmit}
          saving={savingBranch}
          error={formError}
        />
      )}
    </div>
  );
};

function MyBusinesses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, business: null });
  const [uiError, setUiError] = useState(null);

  const {
    data: businesses = [],
    isLoading,
    isFetched,
    error: businessesQueryError,
    refetch,
  } = useBusinessesQuery(Boolean(user));

  const deleteBusinessMutation = useMutation({
    mutationFn: (businessId) => businessAPI.deleteBusiness(businessId),
    onSuccess: (_data, businessId) => {
      queryClient.invalidateQueries({ queryKey: businessKeys.list() });
      queryClient.setQueryData(businessKeys.list(), (prev) => {
        if (!Array.isArray(prev)) {
          return prev;
        }
        return prev.filter((b) => b.id !== businessId);
      });
    },
  });

  const deleting = deleteBusinessMutation.isPending;
  const dataLoaded = isFetched;

  useEffect(() => {
    console.log('MyBusinesses component mounted');

    const token = localStorage.getItem('token');
    console.log('Token found:', !!token);

    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
    }
  }, [navigate]);
  
  // FunciÃ³n para manejar el menÃº desplegable
  const toggleMenu = (businessId) => {
    setOpenMenuId(openMenuId === businessId ? null : businessId);
  };

  // FunciÃ³n para cerrar el menÃº cuando se hace clic fuera
  const closeMenu = () => {
    setOpenMenuId(null);
  };

  // FunciÃ³n para abrir el modal de confirmaciÃ³n
  const openDeleteModal = (business) => {
    setDeleteModal({ isOpen: true, business });
    setOpenMenuId(null); // Cerrar el menÃº
  };

  // FunciÃ³n para cerrar el modal de confirmaciÃ³n
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, business: null });
  };

  // FunciÃ³n para eliminar el negocio
  const handleDeleteBusiness = async () => {
    if (!deleteModal.business) return;

    try {
      await deleteBusinessMutation.mutateAsync(deleteModal.business.id);
      setUiError(null);
      closeDeleteModal();
      console.log(`Business ${deleteModal.business.id} deleted successfully`);
    } catch (error) {
      console.error('Error deleting business:', error);
      setUiError(extractErrorMessage(error, 'Error al eliminar el negocio'));
      closeDeleteModal();
    }
  };

  // FunciÃ³n de debug temporal
  const debugBusinesses = async () => {
    if (!user) return;
    
    try {
      console.log('ðŸ› DEBUG: Checking businesses for user:', user.id);
      const debugData = await businessAPI.debugUserBusinesses(user.id);
      console.log('ðŸ› DEBUG DATA:', debugData);
      alert(`Debug info logged to console. Total relationships: ${debugData.total_relationships}, Total businesses: ${debugData.total_businesses}`);
    } catch (error) {
      console.error('ðŸ› DEBUG ERROR:', error);
      alert(error?.response?.data?.detail || 'Error al ejecutar debug');
    }
  };

  // FunciÃ³n de reparaciÃ³n
  const repairBusinesses = async () => {
    if (!user) return;
    
    try {
      console.log('ðŸ”§ REPAIR: Starting repair for user:', user.id);
      const repairData = await businessAPI.repairUserBusinesses(user.id);
      console.log('ðŸ”§ REPAIR DATA:', repairData);
      
      if (repairData.relationships_repaired > 0) {
        alert(`Â¡ReparaciÃ³n exitosa! Se crearon ${repairData.relationships_repaired} relaciones faltantes.`);
        // Recargar los datos
        await refetch();
      } else {
        alert('No se encontraron negocios huÃ©rfanos para reparar.');
      }
    } catch (error) {
      console.error('ðŸ”§ REPAIR ERROR:', error);
      alert(error?.response?.data?.detail || 'Error durante la reparaciÃ³n. Revisa la consola.');
    }
  };
  
  const queryErrorMessage = businessesQueryError
    ? extractErrorMessage(businessesQueryError, 'Error al cargar los datos')
    : null;

  const errorMessage = uiError ?? (!user ? 'Usuario no autenticado' : queryErrorMessage);

  // Error state
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-lg font-medium mb-4">
            Error: {errorMessage}
          </div>
          <div className="space-y-3">
            <SimpleButton onClick={() => window.location.reload()} className="w-full">
              Recargar pÃ¡gina
            </SimpleButton>
            <SimpleButton
              onClick={() => {
                setUiError(null);
                refetch();
              }}
              variant="outline"
              className="w-full"
            >
              Reintentar
            </SimpleButton>
          </div>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg font-medium">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="Mis Negocios"
        subtitle="Gestiona todos tus negocios desde un solo lugar"
        icon={Building2}
        backPath="/home"
        userName={user?.nombre || 'Usuario'}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Negocios</h1>
              <p className="text-lg text-gray-600">
                Gestiona todos tus negocios desde un solo lugar
              </p>
            </div>
            <div className="flex gap-3">
              {user && (
                <SimpleButton 
                  variant="outline" 
                  size="sm"
                  onClick={debugBusinesses}
                  className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                >
                  ðŸ› Debug
                </SimpleButton>
              )}
              {user && (
                <SimpleButton 
                  variant="outline" 
                  size="sm"
                  onClick={repairBusinesses}
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                >
                  ðŸ”§ Reparar
                </SimpleButton>
              )}
              <SimpleButton 
                onClick={() => navigate('/create-business')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Negocio
              </SimpleButton>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                InformaciÃ³n del Usuario
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="font-medium text-gray-900">
                      {(user.nombre || 'N/A')} {(user.apellido || '')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{user.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rol</p>
                    <p className="font-medium text-gray-900 capitalize">{user.rol || 'usuario'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Businesses Section */}
        {dataLoaded && (
          <div className="mb-8">
            {businesses && businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <div key={business.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {business.nombre || 'Sin nombre'}
                          </h3>
                          {business.descripcion && (
                            <p className="text-gray-600 text-sm">
                              {business.descripcion}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              Creado: {new Date(business.creada_en).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="relative">
                          <SimpleButton 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleMenu(business.id)}
                            className="bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-gray-200"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </SimpleButton>
                          
                          {/* MenÃº desplegable */}
                          {openMenuId === business.id && (
                            <>
                              {/* Overlay para cerrar el menÃº */}
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={closeMenu}
                              ></div>
                              
                              {/* MenÃº */}
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      closeMenu();
                                      alert('Próximamente: Editar negocio');
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 border-none outline-none"
                                    style={{ color: '#374151', backgroundColor: 'white' }}
                                  >
                                    <Edit className="h-4 w-4 text-gray-600" />
                                    <span className="text-gray-700">Editar Negocio</span>
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(business)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left bg-white text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 border-none outline-none"
                                    style={{ color: '#dc2626', backgroundColor: 'white' }}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                    <span className="text-red-600">Eliminar Negocio</span>
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Actions Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <SimpleButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/business/${business.id}/products`)}
                          className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Productos
                        </SimpleButton>
                        <SimpleButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/business/${business.id}/services`)}
                          className="text-gray-700 hover:text-cyan-600 hover:bg-cyan-50"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Servicios
                        </SimpleButton>
                        <SimpleButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/business/${business.id}/customers`)}
                          className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Clientes
                        </SimpleButton>
                        <SimpleButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/business/${business.id}/pos`)}
                          className="text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          POS
                        </SimpleButton>
                      </div>
                      
                      {/* Main Actions */}
                      <div className="space-y-2">
                        <SimpleButton 
                          size="sm"
                          onClick={() => navigate(`/business/${business.id}`)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Panel de Control
                        </SimpleButton>
                        <SimpleButton 
                          variant="outline"
                          size="sm"
                          onClick={() => alert('Próximamente: Configuración del negocio')}
                          className="w-full text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configurar
                        </SimpleButton>
                      </div>

                      <BranchManager
                        business={business}
                        canManage={['admin', 'owner'].includes((business.rol || '').toLowerCase())}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-center py-12 px-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes negocios registrados
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Crea tu primer negocio para comenzar a gestionar productos, clientes y ventas.
                  </p>
                  <Link to="/create-business">
                    <SimpleButton className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Mi Primer Negocio
                    </SimpleButton>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Summary */}
        {dataLoaded && businesses.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Resumen General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{businesses.length}</p>
                <p className="text-sm text-gray-600">Negocios Activos</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-sm text-gray-600">Total Productos</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-sm text-gray-600">Total Clientes</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {deleteModal.isOpen && (
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteBusiness}
          title="Eliminar Negocio"
          message="Â¿EstÃ¡s seguro de que quieres eliminar este negocio?"
          businessName={deleteModal.business?.nombre || ''}
          isDeleting={deleting}
        />
      )}
    </div>
  );
}

export default MyBusinesses; 



