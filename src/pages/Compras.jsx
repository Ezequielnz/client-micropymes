import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseAPI, supplierAPI, productAPI } from '../utils/api';
import { useBusinessContext } from '../contexts/BusinessContext';
import { useUserPermissions } from '../hooks/useUserPermissions';

const formatCurrency = (n) => {
  if (typeof n !== 'number') return '0.00';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const todayStr = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

const CompraCreateModal = ({
  open,
  onClose,
  onSubmit,
  suppliers,
  products,
  isSubmitting,
}) => {
  const [header, setHeader] = useState({
    proveedor_id: '',
    proveedor_nombre: '',
    fecha: todayStr(),
    fecha_entrega: '',
    observaciones: '',
    metodo_pago: 'efectivo',
    estado: 'no_entregado',
  });
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (open) {
      setHeader({ proveedor_id: '', proveedor_nombre: '', fecha: todayStr(), fecha_entrega: '', observaciones: '', metodo_pago: 'efectivo', estado: 'no_entregado' });
      setItems([]);
    }
  }, [open]);

  const addItem = () => {
    setItems((prev) => [...prev, { producto_id: '', cantidad: '', precio_unitario: '' }]);
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const total = useMemo(() => {
    return items.reduce((acc, it) => acc + (Number(it.cantidad || 0) * Number(it.precio_unitario || 0)), 0);
  }, [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) {
      alert('Agrega al menos un ítem');
      return;
    }
    if (!header.metodo_pago) {
      alert('Selecciona un método de pago');
      return;
    }

    const payload = {
      proveedor_id: header.proveedor_id || null,
      proveedor_nombre: header.proveedor_nombre || null,
      fecha: header.fecha,
      metodo_pago: header.metodo_pago,
      estado: header.estado,
      fecha_entrega: header.fecha_entrega || null,
      observaciones: header.observaciones,
      items: items.map((it) => ({
        producto_id: it.producto_id,
        cantidad: Number(it.cantidad) || 0,
        precio_unitario: Number(it.precio_unitario) || 0,
      })),
    };

    await onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 8, padding: 20, width: '95%', maxWidth: 800, maxHeight: '90vh', overflow: 'auto' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#000' }}>Nueva compra</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#000' }}>Proveedor</label>
              <select
                value={header.proveedor_id}
                onChange={(e) => setHeader((h) => ({ ...h, proveedor_id: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#000' }}
              >
                <option value="">Sin proveedor</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre || s.name || s.razon_social || s.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#000' }}>Nombre proveedor (texto)</label>
              <input
                type="text"
                value={header.proveedor_nombre}
                onChange={(e) => setHeader((h) => ({ ...h, proveedor_nombre: e.target.value }))}
                placeholder="Opcional: nombre libre"
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#000' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#000' }}>Fecha</label>
              <input
                type="date"
                value={header.fecha}
                onChange={(e) => setHeader((h) => ({ ...h, fecha: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#000' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#000' }}>Fecha entrega</label>
              <input
                type="date"
                value={header.fecha_entrega}
                onChange={(e) => setHeader((h) => ({ ...h, fecha_entrega: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#000' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#000' }}>Método de pago</label>
              <select
                value={header.metodo_pago}
                onChange={(e) => setHeader((h) => ({ ...h, metodo_pago: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#000' }}
                required
              >
                <option value="">Seleccionar método</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="cheque">Cheque</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#000' }}>Estado</label>
              <select
                value={header.estado}
                onChange={(e) => setHeader((h) => ({ ...h, estado: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#000' }}
                required
              >
                <option value="no_entregado">No entregado</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#000' }}>Observaciones</label>
              <input
                type="text"
                value={header.observaciones}
                onChange={(e) => setHeader((h) => ({ ...h, observaciones: e.target.value }))}
                placeholder="Opcional"
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#000' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 style={{ fontWeight: 600, color: '#000' }}>Ítems</h3>
              <button type="button" onClick={addItem} style={{ background: '#2563eb', color: 'white', padding: '6px 10px', borderRadius: 4, border: 'none' }}>+ Agregar ítem</button>
            </div>
            {items.length === 0 && (
              <div style={{ padding: 12, background: '#f9fafb', border: '1px dashed #e5e7eb', borderRadius: 6, color: '#6b7280' }}>
                No hay ítems. Agrega al menos uno.
              </div>
            )}
            {items.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, alignItems: 'center', margin: '8px 0' }}>
                <div style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>Producto</div>
                <div style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>Cantidad</div>
                <div style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>Precio unitario</div>
                <div></div>
              </div>
            )}
            {items.map((it, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <select
                  value={it.producto_id}
                  onChange={(e) => updateItem(idx, 'producto_id', e.target.value)}
                  style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#000' }}
                  aria-label="Producto"
                  required
                >
                  <option value="">Seleccionar producto</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre || p.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={it.cantidad}
                  onChange={(e) => updateItem(idx, 'cantidad', e.target.value)}
                  style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#000' }}
                  placeholder="Cantidad"
                  aria-label="Cantidad"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={it.precio_unitario}
                  onChange={(e) => updateItem(idx, 'precio_unitario', e.target.value)}
                  style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#000' }}
                  placeholder="Precio unitario ($)"
                  aria-label="Precio unitario"
                  required
                />
                <button type="button" onClick={() => removeItem(idx)} style={{ background: '#ef4444', color: 'white', padding: '6px 10px', borderRadius: 4, border: 'none' }}>Eliminar</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <div style={{ color: '#374151' }}>Total: <strong>${formatCurrency(total)}</strong></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={onClose} disabled={isSubmitting} style={{ background: '#6b7280', color: 'white', padding: '8px 16px', borderRadius: 4, border: 'none', opacity: isSubmitting ? 0.7 : 1 }}>Cancelar</button>
              <button type="submit" disabled={isSubmitting} style={{ background: '#10b981', color: 'white', padding: '8px 16px', borderRadius: 4, border: 'none', opacity: isSubmitting ? 0.7 : 1 }}>{isSubmitting ? 'Guardando...' : 'Guardar compra'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const CompraEditModal = ({ open, onClose, onSubmit, suppliers, compra, isSubmitting }) => {
  const [header, setHeader] = useState({ proveedor_id: '', fecha: todayStr(), observaciones: '' });

  useEffect(() => {
    if (open && compra) {
      setHeader({
        proveedor_id: compra.proveedor_id || '',
        fecha: (compra.fecha || todayStr()).substring(0, 10),
        observaciones: compra.observaciones || '',
      });
    }
  }, [open, compra]);

  if (!open || !compra) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      proveedor_id: header.proveedor_id || null,
      fecha: header.fecha,
      observaciones: header.observaciones,
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 8, padding: 20, width: '95%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#000' }}>Editar compra</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#000' }}>Proveedor</label>
              <select
                value={header.proveedor_id}
                onChange={(e) => setHeader((h) => ({ ...h, proveedor_id: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#000' }}
              >
                <option value="">Sin proveedor</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre || s.name || s.razon_social || s.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#000' }}>Fecha</label>
              <input
                type="date"
                value={header.fecha}
                onChange={(e) => setHeader((h) => ({ ...h, fecha: e.target.value }))}
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#000' }}
                required
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#000' }}>Observaciones</label>
              <input
                type="text"
                value={header.observaciones}
                onChange={(e) => setHeader((h) => ({ ...h, observaciones: e.target.value }))}
                placeholder="Opcional"
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#000' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button type="button" onClick={onClose} disabled={isSubmitting} style={{ background: '#6b7280', color: 'white', padding: '8px 16px', borderRadius: 4, border: 'none', opacity: isSubmitting ? 0.7 : 1 }}>Cancelar</button>
            <button type="submit" disabled={isSubmitting} style={{ background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: 4, border: 'none', opacity: isSubmitting ? 0.7 : 1 }}>{isSubmitting ? 'Guardando...' : 'Guardar cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Compras = () => {
  const { currentBusiness, currentBranch, branches, branchesLoading } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const branchId = currentBranch?.id;
  const branchSelectionRequired = !branchesLoading && (branches?.length ?? 0) > 1;
  const branchReady = !branchSelectionRequired || !!branchId;
  const queryClient = useQueryClient();

  const { canView, canEdit, isLoading: permissionsLoading } = useUserPermissions(businessId);
  const canViewStock = useMemo(() => canView('stock'), [canView]);
  const canEditStock = useMemo(() => canEdit('stock'), [canEdit]);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingCompra, setEditingCompra] = useState(null);

  // Data fetching
  const { data: purchases = [], isLoading: loadingPurchases, error: purchasesError } = useQuery({
    queryKey: ['purchases', businessId, branchId],
    queryFn: () => purchaseAPI.getPurchases(businessId, branchId ? { branch_id: branchId } : undefined),
    enabled: !!businessId && branchReady,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery({
    queryKey: ['suppliers', businessId, branchId],
    queryFn: () => supplierAPI.getSuppliers(businessId),
    enabled: !!businessId && branchReady,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products', businessId, branchId],
    queryFn: () => productAPI.getProducts(businessId),
    enabled: !!businessId && branchReady,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload) => {
      if (!branchReady) throw new Error('Branch context not ready');
      return purchaseAPI.createPurchase(businessId, { ...payload, sucursal_id: branchId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['purchases', businessId, branchId]);
      setShowCreate(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => {
      if (!branchReady) throw new Error('Branch context not ready');
      return purchaseAPI.updatePurchase(businessId, id, { ...payload, sucursal_id: branchId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['purchases', businessId, branchId]);
      setShowEdit(false);
      setEditingCompra(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => purchaseAPI.deletePurchase(businessId, id),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchases', businessId, branchId]);
    },
  });

  const loadPurchaseForEdit = useCallback(async (id) => {
    try {
      const data = await purchaseAPI.getPurchaseById(businessId, id);
      setEditingCompra(data);
      setShowEdit(true);
    } catch (e) {
      console.error('Error loading purchase:', e);
    }
  }, [businessId]);

  // Derive error message before any early returns to keep hook order stable
  const currentErrorMessage = useMemo(() => {
    if (purchasesError) {
      if (purchasesError.response?.status === 401) return 'No tienes autorización para este negocio.';
      if (purchasesError.response?.status === 404) return 'Endpoint de compras no encontrado. Verifica el servidor.';
      return `Error al cargar compras: ${purchasesError.message}`;
    }
    return '';
  }, [purchasesError]);

  // UI states
  if (!currentBusiness) {
    return (
      <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '48px 0', background: '#f8f9fa', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: '#111827', marginBottom: 8 }}>No hay negocio seleccionado</h3>
          <p style={{ color: '#6b7280' }}>Selecciona un negocio para gestionar compras.</p>
        </div>
      </div>
    );
  }

  if (permissionsLoading) {
    return (
      <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '48px 0', background: '#f8f9fa', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: '#6b7280' }}>Cargando permisos...</p>
        </div>
      </div>
    );
  }

  if (!branchReady) {
    return (
      <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '48px 0', background: '#fff7ed', borderRadius: 8, border: '1px solid #fed7aa' }}>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: '#9a3412', marginBottom: 8 }}>Selecciona una sucursal</h3>
          <p style={{ color: '#b45309' }}>Debes elegir una sucursal para gestionar compras.</p>
        </div>
      </div>
    );
  }

  if (!canViewStock) {
    return (
      <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '48px 0', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: '#991b1b', marginBottom: 8 }}>Acceso denegado</h3>
          <p style={{ color: '#7f1d1d' }}>No tienes permisos para ver compras.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 8, color: '#111827' }}>Compras</h1>
        <p style={{ color: '#6b7280' }}>Registra y administra las compras de tu negocio</p>
      </div>

      {currentErrorMessage && (
        <div style={{ background: '#fee', color: '#c33', padding: 10, borderRadius: 6, border: '1px solid #fcc', marginBottom: 16 }}>{currentErrorMessage}</div>
      )}

      <div style={{ marginBottom: 16 }}>
        {canEditStock && (
          <button onClick={() => setShowCreate(true)} disabled={createMutation.isPending}
            style={{ background: '#10b981', color: 'white', padding: '10px 16px', border: 'none', borderRadius: 6, cursor: createMutation.isPending ? 'not-allowed' : 'pointer', opacity: createMutation.isPending ? 0.7 : 1 }}>
            + Nueva compra
          </button>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">Fecha</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">Entrega</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">Estado</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">Proveedor</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">Total</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">Observaciones</th>
              {canEditStock && (
                <th className="px-4 py-3 text-center border-b border-gray-200 text-gray-700 font-medium text-sm">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loadingPurchases ? (
              <tr><td colSpan={canEditStock ? 7 : 6} className="px-4 py-6 text-center text-gray-500">Cargando...</td></tr>
            ) : purchases.length === 0 ? (
              <tr><td colSpan={canEditStock ? 7 : 6} className="px-4 py-6 text-center text-gray-500 italic">No hay compras registradas</td></tr>
            ) : (
              purchases.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 text-sm">{(c.fecha || '').substring(0, 10)}</td>
                  <td className="px-4 py-3 text-gray-900 text-sm">
                    <input
                      type="date"
                      defaultValue={(c.fecha_entrega || '').substring(0, 10)}
                      onChange={async (e) => {
                        const v = e.target.value;
                        try {
                          await updateMutation.mutateAsync({ id: c.id, payload: { fecha_entrega: v || null } });
                        } catch (err) {
                          console.error('Error updating fecha_entrega:', err);
                        }
                      }}
                      disabled={!canEditStock || updateMutation.isPending}
                      className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700"
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-900 text-sm">
                    <select
                      defaultValue={c.estado || 'no_entregado'}
                      onChange={async (e) => {
                        const v = e.target.value;
                        try {
                          await updateMutation.mutateAsync({ id: c.id, payload: { estado: v } });
                        } catch (err) {
                          console.error('Error updating estado:', err);
                        }
                      }}
                      disabled={!canEditStock || updateMutation.isPending}
                      className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700"
                    >
                      <option value="no_entregado">No entregado</option>
                      <option value="entregado">Entregado</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-900 text-sm">{c.proveedor_nombre || c.proveedor_id || '—'}</td>
                  <td className="px-4 py-3 text-gray-900 text-sm font-medium">${formatCurrency(Number(c.total || 0))}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm truncate max-w-xs" title={c.observaciones || ''}>{c.observaciones || '—'}</td>
                  {canEditStock && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => loadPurchaseForEdit(c.id)} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Editar</button>
                        <button onClick={async () => {
                          if (!window.confirm('¿Eliminar compra? Esto revertirá el stock.')) return;
                          try { await deleteMutation.mutateAsync(c.id); } catch (e) { console.error(e); }
                        }} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Eliminar</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="block md:hidden">
        {loadingPurchases ? (
          <div className="p-6 text-center text-gray-500">Cargando...</div>
        ) : purchases.length === 0 ? (
          <div className="p-6 text-center text-gray-500 italic">No hay compras registradas</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {purchases.map((c) => (
              <div key={c.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 text-sm">{(c.fecha || '').substring(0, 10)}</h3>
                  <span className="text-lg font-semibold text-blue-600">${formatCurrency(Number(c.total || 0))}</span>
                </div>
                <div className="text-xs text-gray-700 mb-2">
                  <span className="font-medium">Proveedor:</span> {c.proveedor_nombre || c.proveedor_id || '—'}
                </div>
                <div className="text-xs text-gray-700 mb-2">
                  <span className="font-medium">Entrega:</span>{' '}
                  <input
                    type="date"
                    defaultValue={(c.fecha_entrega || '').substring(0, 10)}
                    onChange={async (e) => {
                      const v = e.target.value;
                      try {
                        await updateMutation.mutateAsync({ id: c.id, payload: { fecha_entrega: v || null } });
                      } catch (err) {
                        console.error('Error updating fecha_entrega:', err);
                      }
                    }}
                    disabled={!canEditStock || updateMutation.isPending}
                    className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-700"
                  />
                </div>
                <div className="text-xs text-gray-700 mb-2">
                  <span className="font-medium">Estado:</span>{' '}
                  <select
                    defaultValue={c.estado || 'no_entregado'}
                    onChange={async (e) => {
                      const v = e.target.value;
                      try {
                        await updateMutation.mutateAsync({ id: c.id, payload: { estado: v } });
                      } catch (err) {
                        console.error('Error updating estado:', err);
                      }
                    }}
                    disabled={!canEditStock || updateMutation.isPending}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded text-xs text-gray-700"
                  >
                    <option value="no_entregado">No entregado</option>
                    <option value="entregado">Entregado</option>
                  </select>
                </div>
                {c.observaciones && (
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">{c.observaciones}</p>
                )}
                {canEditStock && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => loadPurchaseForEdit(c.id)} className="flex-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">Editar</button>
                    <button onClick={async () => {
                      if (!window.confirm('¿Eliminar compra? Esto revertirá el stock.')) return;
                      try { await deleteMutation.mutateAsync(c.id); } catch (e) { console.error(e); }
                    }} className="flex-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">Eliminar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <CompraCreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={async (payload) => {
          try {
            await createMutation.mutateAsync(payload);
          } catch (e) {
            console.error('Error creating purchase:', e);
          }
        }}
        suppliers={suppliers}
        products={products}
        isSubmitting={createMutation.isPending}
      />

      <CompraEditModal
        open={showEdit}
        onClose={() => { setShowEdit(false); setEditingCompra(null); }}
        onSubmit={async (payload) => {
          try {
            await updateMutation.mutateAsync({ id: editingCompra.id, payload });
          } catch (e) {
            console.error('Error updating purchase:', e);
          }
        }}
        suppliers={suppliers}
        compra={editingCompra}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
};

export default Compras;


