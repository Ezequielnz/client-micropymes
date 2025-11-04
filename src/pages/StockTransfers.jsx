import React, { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, RefreshCw, Check, X, Trash2 } from 'lucide-react';

import Layout from '../components/Layout';
import { useBusinessContext } from '../contexts/BusinessContext';
import { productAPI, stockTransferAPI } from '../utils/api';

const STATUS_META = {
  borrador: { label: 'Borrador', badge: 'bg-slate-100 text-slate-700' },
  confirmada: { label: 'Confirmada', badge: 'bg-blue-100 text-blue-700' },
  cancelada: { label: 'Cancelada', badge: 'bg-rose-100 text-rose-700' },
  recibida: { label: 'Recibida', badge: 'bg-emerald-100 text-emerald-700' },
};

const DEFAULT_LIMIT = 50;

const MESSAGE_STYLES = {
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
};

const formatDate = (iso) => {
  if (!iso) {
    return '-';
  }
  try {
    return new Date(iso).toLocaleString();
  } catch (error) {
    return iso;
  }
};

const StockTransfers = () => {
  const queryClient = useQueryClient();
  const {
    currentBusiness,
    currentBranch,
    branches,
    branchSettings,
    branchSettingsLoading,
    branchSettingsError,
  } = useBusinessContext();

  const businessId = currentBusiness?.id ?? null;

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [form, setForm] = useState({
    origin: null,
    destination: null,
    comment: '',
    items: [],
  });
  const [newItem, setNewItem] = useState({ productId: '', quantity: 1 });
  const [message, setMessage] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    origin: '',
    destination: '',
    limit: String(DEFAULT_LIMIT),
  });

  const normalizedLimit = useMemo(() => {
    const parsed = Number(filters.limit);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_LIMIT;
  }, [filters.limit]);

  const filterParams = useMemo(() => {
    const params = {};
    if (filters.status && filters.status !== 'all') {
      params.estado = filters.status;
    }
    if (filters.origin) {
      params.origen_sucursal_id = filters.origin;
    }
    if (filters.destination) {
      params.destino_sucursal_id = filters.destination;
    }
    params.limit = normalizedLimit;
    return params;
  }, [filters.status, filters.origin, filters.destination, normalizedLimit]);

  const transferQueryKey = useMemo(
    () => [
      'stock-transfers',
      businessId ?? 'no-business',
      filters.status || 'all',
      filters.origin || 'all',
      filters.destination || 'all',
      normalizedLimit,
    ],
    [businessId, filters.status, filters.origin, filters.destination, normalizedLimit],
  );


  const branchOptions = useMemo(() => branches ?? [], [branches]);
  const branchMap = useMemo(() => {
    const map = new Map();
    branchOptions.forEach((branch) => map.set(branch.id, branch));
    return map;
  }, [branchOptions]);

  const isCentralized = branchSettings?.inventario_modo === 'centralizado';

  const statusFilterOptions = useMemo(
    () => Object.entries(STATUS_META).map(([value, meta]) => ({ value, label: meta.label })),
    [],
  );

  const limitOptions = useMemo(() => [25, 50, 100, 200].map((value) => String(value)), []);

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ status: 'all', origin: '', destination: '', limit: String(DEFAULT_LIMIT) });
  }, []);

  const hasActiveFilters =
    filters.status !== 'all' || filters.origin || filters.destination || normalizedLimit !== DEFAULT_LIMIT;

  const {
    data: transfers = [],
    isLoading: loadingTransfers,
    isFetching: fetchingTransfers,
    refetch: refetchTransfers,
    error: transferError,
  } = useQuery({
    queryKey: transferQueryKey,
    queryFn: () => stockTransferAPI.list(businessId, filterParams),
    enabled: !!businessId,
    keepPreviousData: true,
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products', businessId, 'stock-transfers'],
    queryFn: () => productAPI.getProducts(businessId),
    enabled: !!businessId && (wizardOpen || (transfers?.length ?? 0) > 0),
    staleTime: 60000,
  });

  const productMap = useMemo(() => {
    const map = new Map();
    (products || []).forEach((product) => map.set(product.id, product));
    return map;
  }, [products]);

  const originBranchId = form.origin ? String(form.origin) : null;

  const toFiniteNumber = useCallback((value) => {
    if (value === null || value === undefined) {
      return null;
    }
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric)) {
      return null;
    }
    return numeric;
  }, []);

  const resolveBranchQuantity = useCallback((source, branchId) => {
    if (!source || !branchId) {
      return null;
    }
    const targetKey = String(branchId);
    if (Array.isArray(source)) {
      const match = source.find((entry) => {
        if (!entry) {
          return false;
        }
        const candidate =
          entry.sucursal_id ??
          entry.branch_id ??
          entry.branchId ??
          entry.branch ??
          entry.id;
        return candidate && String(candidate) === targetKey;
      });
      if (!match) {
        return null;
      }
      const rawValue =
        match.stock_actual ??
        match.stock ??
        match.quantity ??
        match.cantidad ??
        match.available ??
        match.valor;
      return toFiniteNumber(rawValue);
    }
    if (typeof source === 'object') {
      const direct =
        source[targetKey] ??
        source[String(branchId)] ??
        null;
      if (direct === null || direct === undefined) {
        return null;
      }
      if (typeof direct === 'object') {
        const nestedValue =
          direct.stock_actual ??
          direct.stock ??
          direct.quantity ??
          direct.cantidad ??
          direct.available ??
          direct.valor;
        return toFiniteNumber(nestedValue);
      }
      return toFiniteNumber(direct);
    }
    return null;
  }, [toFiniteNumber]);

  const getProductAvailability = useCallback(
    (productId) => {
      const product = productMap.get(productId);
      if (!product) {
        return null;
      }

      if (originBranchId) {
        const branchSources = [
          product.stock_por_sucursal,
          product.stockPorSucursal,
          product.stock_by_branch,
          product.stockByBranch,
          product.branch_stock,
          product.branchStock,
          product.inventory_by_branch,
          product.inventoryByBranch,
          product.inventario_sucursales,
        ];
        for (const source of branchSources) {
          const resolved = resolveBranchQuantity(source, originBranchId);
          if (resolved !== null) {
            return resolved;
          }
        }
      }

      const fallback =
        toFiniteNumber(product.stock_actual) ??
        toFiniteNumber(product.stock) ??
        toFiniteNumber(product.stockDisponible) ??
        toFiniteNumber(product.available_stock);
      return fallback;
    },
    [productMap, originBranchId, resolveBranchQuantity, toFiniteNumber],
  );

  const getProductOptionLabel = useCallback(
    (product) => {
      if (!product) {
        return '';
      }
      const baseLabel =
        product.nombre ||
        product.codigo ||
        (product.id ? String(product.id).slice(0, 8) : 'Producto');
      const availability = getProductAvailability(product.id);
      if (availability === null) {
        return baseLabel;
      }
      const formatted = availability.toLocaleString('es-AR');
      const scopeLabel = isCentralized ? 'Stock total' : 'Stock origen';
      return `${baseLabel} – ${scopeLabel}: ${formatted}`;
    },
    [getProductAvailability, isCentralized],
  );

  const currentProductAvailability =
    newItem.productId ? getProductAvailability(newItem.productId) : null;

  const availabilityLabel = isCentralized ? 'Stock disponible' : 'Stock en sucursal origen';

  const invalidate = () => {
    if (businessId) {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers', businessId] });
    }
  };

  const createMutation = useMutation({
    mutationFn: (payload) => stockTransferAPI.create(businessId, payload),
    onSuccess: () => {
      invalidate();
      setMessage({ type: 'success', text: 'Transferencia creada.' });
    },
    onError: (error) => {
      const detail = error?.response?.data?.detail || 'No se pudo crear la transferencia.';
      setMessage({ type: 'error', text: detail });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id) => stockTransferAPI.confirm(businessId, id),
    onSuccess: () => {
      invalidate();
      setMessage({ type: 'success', text: 'Transferencia confirmada.' });
    },
    onError: (error) => {
      const detail = error?.response?.data?.detail || 'No se pudo confirmar la transferencia.';
      setMessage({ type: 'error', text: detail });
    },
  });

  const receiveMutation = useMutation({
    mutationFn: (id) => stockTransferAPI.receive(businessId, id),
    onSuccess: () => {
      invalidate();
      setMessage({ type: 'success', text: 'Transferencia marcada como recibida.' });
    },
    onError: (error) => {
      const detail =
        error?.response?.data?.detail || 'No se pudo marcar la transferencia como recibida.';
      setMessage({ type: 'error', text: detail });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => stockTransferAPI.delete(businessId, id),
    onSuccess: () => {
      invalidate();
      setMessage({ type: 'success', text: 'Transferencia eliminada.' });
    },
    onError: (error) => {
      const detail = error?.response?.data?.detail || 'No se pudo eliminar la transferencia.';
      setMessage({ type: 'error', text: detail });
    },
  });

  const openWizard = () => {
    const defaultOrigin =
      currentBranch?.id ||
      branchSettings?.default_branch_id ||
      branchOptions[0]?.id ||
      null;
    const defaultDestination =
      branchOptions.find((branch) => branch.id !== defaultOrigin)?.id || null;

    setForm({
      origin: defaultOrigin,
      destination: defaultDestination,
      comment: '',
      items: [],
    });
    setNewItem({ productId: '', quantity: 1 });
    setWizardStep(0);
    setWizardOpen(true);
    setMessage(null);
  };

  const closeWizard = () => {
    setWizardOpen(false);
  };

  const handleAddItem = () => {
    if (!newItem.productId) {
      setMessage({ type: 'error', text: 'Selecciona un producto.' });
      return;
    }
    const quantity = Number(newItem.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setMessage({ type: 'error', text: 'La cantidad debe ser mayor a 0.' });
      return;
    }
    const available = getProductAvailability(newItem.productId);
    const warningMessage =
      available !== null && quantity > available
        ? `${availabilityLabel}: ${available.toLocaleString('es-AR')} disponibles. Revisa la cantidad antes de confirmar.`
        : null;

    setForm((prev) => {
      const existing = prev.items.find((item) => item.productId === newItem.productId);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.productId === newItem.productId
              ? { ...item, quantity: Number(item.quantity) + quantity }
              : item,
          ),
        };
      }
      return {
        ...prev,
        items: [...prev.items, { productId: newItem.productId, quantity }],
      };
    });
    setNewItem({ productId: '', quantity: 1 });
    setMessage(warningMessage ? { type: 'warning', text: warningMessage } : null);
  };

  const handleRemoveItem = (productId) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.productId !== productId),
    }));
  };

  const goNext = () => {
    if (wizardStep === 0) {
      if (!form.origin || !form.destination || form.origin === form.destination) {
        setMessage({ type: 'error', text: 'Selecciona sucursales válidas.' });
        return;
      }
    }
    if (wizardStep === 1 && !form.items.length) {
      setMessage({ type: 'error', text: 'Agrega al menos un producto.' });
      return;
    }
    setMessage(null);
    setWizardStep((step) => Math.min(2, step + 1));
  };

  const goBack = () => {
    setMessage(null);
    setWizardStep((step) => Math.max(0, step - 1));
  };

  const handleCreate = async () => {
    if (!form.origin || !form.destination || form.origin === form.destination) {
      setMessage({ type: 'error', text: 'Selecciona sucursales válidas.' });
      return;
    }
    if (!form.items.length) {
      setMessage({ type: 'error', text: 'Agrega al menos un producto.' });
      return;
    }
    try {
      await createMutation.mutateAsync({
        origen_sucursal_id: form.origin,
        destino_sucursal_id: form.destination,
        comentarios: form.comment || null,
        items: form.items.map((item) => ({
          producto_id: item.productId,
          cantidad: Number(item.quantity),
        })),
      });
      setWizardOpen(false);
    } catch {
      // handled in onError
    }
  };

  const handleConfirm = async (id) => {
    try {
      await confirmMutation.mutateAsync(id);
    } catch {
      // handled in onError
    }
  };

  const handleReceive = async (id) => {
    try {
      await receiveMutation.mutateAsync(id);
    } catch {
      // handled in onError
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // handled in onError
    }
  };

  const canCreate =
    Boolean(businessId) &&
    branchOptions.length >= 2 &&
    branchSettings?.permite_transferencias !== false &&
    !branchSettingsLoading;

  const renderTransfers = () => {
    if (!businessId) {
      return (
        <div className="rounded border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">
          Selecciona un negocio para ver sus transferencias.
        </div>
      );
    }
    if (loadingTransfers) {
      return (
        <div className="flex items-center justify-center rounded border border-slate-200 bg-white p-6 text-slate-600">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
          Cargando transferencias...
        </div>
      );
    }
    if (transferError) {
      return (
        <div className="rounded border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          No se pudieron cargar las transferencias. Intenta nuevamente.
        </div>
      );
    }
    if (!transfers.length) {
      return (
        <div className="rounded border border-slate-200 bg-white p-6 text-center text-slate-600">
          Aún no registraste transferencias en este negocio.
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {transfers.map((transfer) => {
          const status = STATUS_META[transfer.estado] || STATUS_META.borrador;
          const origin = branchMap.get(transfer.origen_sucursal_id);
          const destination = branchMap.get(transfer.destino_sucursal_id);
          return (
            <div
              key={transfer.id}
              className="rounded border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500">{formatDate(transfer.created_at)}</div>
                  <div className="text-sm font-semibold text-slate-900">
                    Transferencia {transfer.id.slice(0, 8)}
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    status.badge || ''
                  }`}
                >
                  {status.label}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <div className="rounded border border-slate-200 bg-slate-50 p-2">
                  <div className="text-xs text-slate-500">Origen</div>
                  <div className="font-medium text-slate-900">
                    {origin?.nombre || transfer.origen_sucursal_id}
                  </div>
                </div>
                <div className="rounded border border-slate-200 bg-slate-50 p-2">
                  <div className="text-xs text-slate-500">Destino</div>
                  <div className="font-medium text-slate-900">
                    {destination?.nombre || transfer.destino_sucursal_id}
                  </div>
                </div>
              </div>
              {transfer.comentarios && (
                <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
                  {transfer.comentarios}
                </div>
              )}
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase text-slate-500">
                  Productos ({transfer.items.length})
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {transfer.items.map((item) => {
                    const product = productMap.get(item.producto_id);
                    return (
                      <li
                        key={item.id || `${transfer.id}-${item.producto_id}`}
                        className="flex items-center justify-between rounded border border-slate-200 bg-white px-2 py-1"
                      >
                        <span>{product?.nombre || item.producto_id.slice(0, 8)}</span>
                        <span className="font-medium">
                          {Number(item.cantidad).toLocaleString('es-AR')}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                {transfer.estado === 'borrador' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleConfirm(transfer.id)}
                      disabled={confirmMutation.isPending}
                      className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1 text-white disabled:bg-blue-300"
                    >
                      {confirmMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(transfer.id)}
                      disabled={deleteMutation.isPending}
                      className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-1 text-slate-700 disabled:opacity-60"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Eliminar
                    </button>
                  </>
                )}
                {transfer.estado === 'confirmada' && (
                  <button
                    type="button"
                    onClick={() => handleReceive(transfer.id)}
                    disabled={receiveMutation.isPending}
                    className="inline-flex items-center gap-2 rounded bg-emerald-600 px-3 py-1 text-white disabled:bg-emerald-300"
                  >
                    {receiveMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    Marcar como recibida
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <Layout activeSection="stock-transfers">
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Transferencias de stock</h1>
            <p className="text-sm text-slate-600">
              Gestiona los movimientos entre sucursales del negocio seleccionado.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetchTransfers()}
              className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              {fetchingTransfers ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Actualizar
            </button>
            <button
              type="button"
              onClick={openWizard}
              disabled={!canCreate}
              className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <Plus className="h-4 w-4" />
              Nueva transferencia
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`flex items-start justify-between rounded border px-4 py-3 text-sm ${
              MESSAGE_STYLES[message.type] || 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-3 text-xs uppercase">
              Cerrar
            </button>
          </div>
        )}

        {branchSettingsLoading && (
          <div className="flex items-center gap-2 rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            Cargando configuraci&oacute;n del negocio...
          </div>
        )}

        {branchSettingsError && (
          <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            No se pudo cargar la configuraci&oacute;n de sucursales. Algunas acciones pueden estar
            limitadas.
          </div>
        )}

        {branchSettings && branchSettings.permite_transferencias === false && (
          <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Las transferencias est&aacute;n deshabilitadas. Act&iacute;valas desde la configuraci&oacute;n
            del negocio para crear nuevos movimientos.
          </div>
        )}

        {renderTransfers()}
      </div>

      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-lg font-semibold text-slate-900">Nueva transferencia</h2>
              <button
                type="button"
                onClick={closeWizard}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-4 py-4 text-sm">
              <div className="text-xs text-slate-500">
                Paso {wizardStep + 1} de 3
              </div>

              {wizardStep === 0 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700">Sucursal origen</label>
                    <select
                      value={form.origin ?? ''}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, origin: event.target.value || null }))
                      }
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                    >
                      <option value="">Selecciona una sucursal</option>
                      {branchOptions.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700">Sucursal destino</label>
                    <select
                      value={form.destination ?? ''}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, destination: event.target.value || null }))
                      }
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                    >
                      <option value="">Selecciona una sucursal</option>
                      {branchOptions.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700">Comentario (opcional)</label>
                    <textarea
                      value={form.comment}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, comment: event.target.value }))
                      }
                      rows={3}
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700">Producto</label>
                    <select
                      value={newItem.productId}
                      onChange={(event) =>
                        setNewItem((prev) => ({ ...prev, productId: event.target.value }))
                      }
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                    >
                      <option value="">Selecciona un producto</option>
                      {loadingProducts && <option>Cargando productos...</option>}
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {getProductOptionLabel(product)}
                        </option>
                      ))}
                    </select>
                    {newItem.productId && (
                      <p
                        className={`mt-1 text-xs ${
                          form.origin && currentProductAvailability !== null ? 'text-slate-500' : 'text-amber-600'
                        }`}
                      >
                        {form.origin ? (
                          currentProductAvailability !== null
                            ? `${availabilityLabel}: ${currentProductAvailability.toLocaleString('es-AR')}`
                            : 'Stock visible no disponible para este producto.'
                        ) : 'Selecciona una sucursal de origen para ver disponibilidad.'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-700">Cantidad</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.quantity}
                      onChange={(event) =>
                        setNewItem((prev) => ({ ...prev, quantity: event.target.value }))
                      }
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar producto
                  </button>

                  {form.items.length > 0 && (
                    <ul className="divide-y divide-slate-200 rounded border border-slate-200">
                      {form.items.map((item) => {
                        const product = productMap.get(item.productId);
                        const availability = getProductAvailability(item.productId);
                        const insufficient =
                          availability !== null && Number(item.quantity) > availability;
                        const availabilityText = form.origin
                          ? availability !== null
                            ? `${availabilityLabel}: ${availability.toLocaleString('es-AR')}`
                            : 'Stock visible no disponible.'
                          : 'Selecciona una sucursal de origen para ver disponibilidad.';
                        const availabilityClass = form.origin
                          ? availability !== null
                            ? insufficient
                              ? 'text-rose-600'
                              : 'text-slate-500'
                            : 'text-amber-600'
                          : 'text-amber-600';
                        return (
                          <li key={item.productId} className="flex items-center justify-between px-3 py-2">
                            <div>
                              <div className="font-medium text-slate-800">
                                {product?.nombre || item.productId.slice(0, 8)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {Number(item.quantity).toLocaleString('es-AR')}
                              </div>
                              <div className={`text-xs ${availabilityClass}`}>
                                {availabilityText}
                                {insufficient ? ' (insuficiente)' : ''}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.productId)}
                              className="rounded p-1 text-slate-500 hover:bg-slate-100"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-3">
                  <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm">
                    <div>
                      <span className="font-semibold text-slate-600">Origen:</span>{' '}
                      {branchMap.get(form.origin)?.nombre || form.origin}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-600">Destino:</span>{' '}
                      {branchMap.get(form.destination)?.nombre || form.destination}
                    </div>
                    {form.comment && (
                      <div className="mt-2 text-xs text-slate-600">Nota: {form.comment}</div>
                    )}
                  </div>
                  <ul className="space-y-1 text-sm">
                    {form.items.map((item) => {
                      const product = productMap.get(item.productId);
                      const availability = getProductAvailability(item.productId);
                      const insufficient =
                        availability !== null && Number(item.quantity) > availability;
                      const availabilityText = form.origin
                        ? availability !== null
                          ? `${availabilityLabel}: ${availability.toLocaleString('es-AR')}`
                          : 'Stock visible no disponible.'
                        : 'Selecciona una sucursal de origen para ver disponibilidad.';
                      const availabilityClass = form.origin
                        ? availability !== null
                          ? insufficient
                            ? 'text-rose-600'
                            : 'text-slate-500'
                          : 'text-amber-600'
                        : 'text-amber-600';
                      return (
                        <li
                          key={item.productId}
                          className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2"
                        >
                          <span className="flex flex-col">
                            <span className="font-medium text-slate-800">
                              {product?.nombre || item.productId.slice(0, 8)}
                            </span>
                            <span className={`text-xs ${availabilityClass}`}>
                              {availabilityText}
                              {insufficient ? ' (insuficiente)' : ''}
                            </span>
                          </span>
                          <span className="font-medium text-slate-700">
                            {Number(item.quantity).toLocaleString('es-AR')}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
              <div className="text-slate-500">Paso {wizardStep + 1} de 3</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={wizardStep === 0 ? closeWizard : goBack}
                  className="rounded border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-100"
                >
                  {wizardStep === 0 ? 'Cancelar' : 'Anterior'}
                </button>
                {wizardStep < 2 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                    className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Crear transferencia
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StockTransfers;
