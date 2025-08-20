import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierAPI } from '../utils/api';
import { useBusinessContext } from '../contexts/BusinessContext';
import { useUserPermissions } from '../hooks/useUserPermissions';

const SupplierCreateModal = ({ open, onClose, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState({
    nombre: '',
    cuit_cuil: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    pais: '',
    condiciones_pago: '',
    observaciones: '',
    estado: '',
  });

  useEffect(() => {
    if (open) {
      setForm({
        nombre: '',
        cuit_cuil: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        provincia: '',
        pais: '',
        condiciones_pago: '',
        observaciones: '',
        estado: '',
      });
    }
  }, [open]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre?.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    await onSubmit({
      nombre: form.nombre.trim(),
      cuit_cuil: form.cuit_cuil || null,
      email: form.email || null,
      telefono: form.telefono || null,
      direccion: form.direccion || null,
      ciudad: form.ciudad || null,
      provincia: form.provincia || null,
      pais: form.pais || null,
      condiciones_pago: form.condiciones_pago || null,
      observaciones: form.observaciones || null,
      estado: form.estado || null,
    });
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 8, padding: 20, width: '95%', maxWidth: 800, maxHeight: '90vh', overflow: 'auto' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Nuevo proveedor</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Nombre</label>
              <input type="text" value={form.nombre} onChange={(e) => update('nombre', e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>CUIT/CUIL</label>
              <input type="text" value={form.cuit_cuil} onChange={(e) => update('cuit_cuil', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Teléfono</label>
              <input type="text" value={form.telefono} onChange={(e) => update('telefono', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Dirección</label>
              <input type="text" value={form.direccion} onChange={(e) => update('direccion', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Ciudad</label>
              <input type="text" value={form.ciudad} onChange={(e) => update('ciudad', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Provincia</label>
              <input type="text" value={form.provincia} onChange={(e) => update('provincia', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>País</label>
              <input type="text" value={form.pais} onChange={(e) => update('pais', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Condiciones de pago</label>
              <input type="text" value={form.condiciones_pago} onChange={(e) => update('condiciones_pago', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Estado</label>
              <input type="text" value={form.estado} onChange={(e) => update('estado', e.target.value)} placeholder="Activo / Inactivo" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Observaciones</label>
              <input type="text" value={form.observaciones} onChange={(e) => update('observaciones', e.target.value)} placeholder="Opcional" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button type="button" onClick={onClose} disabled={isSubmitting} style={{ background: '#6b7280', color: 'white', padding: '8px 16px', borderRadius: 4, border: 'none', opacity: isSubmitting ? 0.7 : 1 }}>Cancelar</button>
            <button type="submit" disabled={isSubmitting} style={{ background: '#10b981', color: 'white', padding: '8px 16px', borderRadius: 4, border: 'none', opacity: isSubmitting ? 0.7 : 1 }}>{isSubmitting ? 'Guardando...' : 'Guardar proveedor'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SupplierEditModal = ({ open, onClose, onSubmit, isSubmitting, supplier }) => {
  const [form, setForm] = useState({
    nombre: '',
    cuit_cuil: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    pais: '',
    condiciones_pago: '',
    observaciones: '',
    estado: '',
  });

  useEffect(() => {
    if (open && supplier) {
      setForm({
        nombre: supplier.nombre || '',
        cuit_cuil: supplier.cuit_cuil || '',
        email: supplier.email || '',
        telefono: supplier.telefono || '',
        direccion: supplier.direccion || '',
        ciudad: supplier.ciudad || '',
        provincia: supplier.provincia || '',
        pais: supplier.pais || '',
        condiciones_pago: supplier.condiciones_pago || '',
        observaciones: supplier.observaciones || '',
        estado: supplier.estado || '',
      });
    }
  }, [open, supplier]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nombre: form.nombre?.trim() || undefined,
      cuit_cuil: form.cuit_cuil || undefined,
      email: form.email || undefined,
      telefono: form.telefono || undefined,
      direccion: form.direccion || undefined,
      ciudad: form.ciudad || undefined,
      provincia: form.provincia || undefined,
      pais: form.pais || undefined,
      condiciones_pago: form.condiciones_pago || undefined,
      observaciones: form.observaciones || undefined,
      estado: form.estado || undefined,
    };
    await onSubmit(payload);
  };

  if (!open || !supplier) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 8, padding: 20, width: '95%', maxWidth: 800, maxHeight: '90vh', overflow: 'auto' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Editar proveedor</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Nombre</label>
              <input type="text" value={form.nombre} onChange={(e) => update('nombre', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>CUIT/CUIL</label>
              <input type="text" value={form.cuit_cuil} onChange={(e) => update('cuit_cuil', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Teléfono</label>
              <input type="text" value={form.telefono} onChange={(e) => update('telefono', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Dirección</label>
              <input type="text" value={form.direccion} onChange={(e) => update('direccion', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Ciudad</label>
              <input type="text" value={form.ciudad} onChange={(e) => update('ciudad', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Provincia</label>
              <input type="text" value={form.provincia} onChange={(e) => update('provincia', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>País</label>
              <input type="text" value={form.pais} onChange={(e) => update('pais', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Condiciones de pago</label>
              <input type="text" value={form.condiciones_pago} onChange={(e) => update('condiciones_pago', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Estado</label>
              <input type="text" value={form.estado} onChange={(e) => update('estado', e.target.value)} placeholder="Activo / Inactivo" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Observaciones</label>
              <input type="text" value={form.observaciones} onChange={(e) => update('observaciones', e.target.value)} placeholder="Opcional" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
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

const Proveedores = () => {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const queryClient = useQueryClient();

  const { canView, canEdit, isLoading: permissionsLoading } = useUserPermissions(businessId);
  const canViewStock = useMemo(() => canView('stock'), [canView]);
  const canEditStock = useMemo(() => canEdit('stock'), [canEdit]);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const { data: suppliers = [], isLoading: loadingSuppliers, error: suppliersError } = useQuery({
    queryKey: ['suppliers', businessId],
    queryFn: () => supplierAPI.getSuppliers(businessId),
    enabled: !!businessId && !!currentBusiness,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => supplierAPI.createSupplier(businessId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers', businessId]);
      setShowCreate(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => supplierAPI.updateSupplier(businessId, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers', businessId]);
      setShowEdit(false);
      setEditingSupplier(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => supplierAPI.deleteSupplier(businessId, id),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers', businessId]);
    }
  });

  const loadSupplierForEdit = useCallback(async (id) => {
    try {
      const data = await supplierAPI.getSupplierById(businessId, id);
      setEditingSupplier(data);
      setShowEdit(true);
    } catch (e) {
      console.error('Error loading supplier:', e);
    }
  }, [businessId]);

  const currentErrorMessage = useMemo(() => {
    if (suppliersError) {
      if (suppliersError.response?.status === 401) return 'No tienes autorización para este negocio.';
      if (suppliersError.response?.status === 404) return 'Endpoint de proveedores no encontrado. Verifica el servidor.';
      return `Error al cargar proveedores: ${suppliersError.message}`;
    }
    return '';
  }, [suppliersError]);

  if (!currentBusiness) {
    return (
      <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '48px 0', background: '#f8f9fa', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: '#111827', marginBottom: 8 }}>No hay negocio seleccionado</h3>
          <p style={{ color: '#6b7280' }}>Selecciona un negocio para gestionar proveedores.</p>
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

  if (!canViewStock) {
    return (
      <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '48px 0', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: '#991b1b', marginBottom: 8 }}>Acceso denegado</h3>
          <p style={{ color: '#7f1d1d' }}>No tienes permisos para ver proveedores.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 8, color: '#111827' }}>Proveedores</h1>
        <p style={{ color: '#6b7280' }}>Administra los proveedores de tu negocio</p>
      </div>

      {currentErrorMessage && (
        <div style={{ background: '#fee', color: '#c33', padding: 10, borderRadius: 6, border: '1px solid #fcc', marginBottom: 16 }}>{currentErrorMessage}</div>
      )}

      <div style={{ marginBottom: 16 }}>
        {canEditStock && (
          <button onClick={() => setShowCreate(true)} disabled={createMutation.isPending}
            style={{ background: '#10b981', color: 'white', padding: '10px 16px', border: 'none', borderRadius: 6, cursor: createMutation.isPending ? 'not-allowed' : 'pointer', opacity: createMutation.isPending ? 0.7 : 1 }}>
            + Nuevo proveedor
          </button>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">Nombre</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">Email</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">Teléfono</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">Ciudad</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">Provincia</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">País</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">Condiciones</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">Estado</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 text-gray-700 font-medium text-sm">Observaciones</th>
              {canEditStock && (
                <th className="px-4 py-3 text-center border-b border-gray-200 text-gray-700 font-medium text-sm">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loadingSuppliers ? (
              <tr><td colSpan={canEditStock ? 10 : 9} className="px-4 py-6 text-center text-gray-500">Cargando...</td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={canEditStock ? 10 : 9} className="px-4 py-6 text-center text-gray-500 italic">No hay proveedores cargados</td></tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 text-sm">{s.nombre}</td>
                  <td className="px-4 py-3 text-gray-900 text-sm">{s.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-900 text-sm">{s.telefono || '—'}</td>
                  <td className="px-4 py-3 text-gray-900 text-sm">{s.ciudad || '—'}</td>
                  <td className="px-4 py-3 text-gray-900 text-sm">{s.provincia || '—'}</td>
                  <td className="px-4 py-3 text-gray-900 text-sm">{s.pais || '—'}</td>
                  <td className="px-4 py-3 text-gray-900 text-sm truncate max-w-xs" title={s.condiciones_pago || ''}>{s.condiciones_pago || '—'}</td>
                  <td className="px-4 py-3 text-gray-900 text-sm">{s.estado || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm truncate max-w-xs" title={s.observaciones || ''}>{s.observaciones || '—'}</td>
                  {canEditStock && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => loadSupplierForEdit(s.id)} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Editar</button>
                        <button onClick={async () => {
                          if (!window.confirm('¿Eliminar proveedor? Si tiene compras asociadas, la operación fallará.')) return;
                          try { await deleteMutation.mutateAsync(s.id); } catch (e) { console.error(e); }
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
        {loadingSuppliers ? (
          <div className="p-6 text-center text-gray-500">Cargando...</div>
        ) : suppliers.length === 0 ? (
          <div className="p-6 text-center text-gray-500 italic">No hay proveedores cargados</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {suppliers.map((s) => (
              <div key={s.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 text-sm">{s.nombre}</h3>
                </div>
                <div className="text-xs text-gray-700 mb-1"><span className="font-medium">Email:</span> {s.email || '—'}</div>
                <div className="text-xs text-gray-700 mb-1"><span className="font-medium">Tel:</span> {s.telefono || '—'}</div>
                {(s.ciudad || s.provincia || s.pais) && (
                  <div className="text-xs text-gray-700 mb-1"><span className="font-medium">Ubicación:</span> {[s.ciudad, s.provincia, s.pais].filter(Boolean).join(', ')}</div>
                )}
                {s.condiciones_pago && (
                  <div className="text-xs text-gray-700 mb-1 truncate"><span className="font-medium">Condiciones:</span> {s.condiciones_pago}</div>
                )}
                {s.observaciones && (
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">{s.observaciones}</p>
                )}
                {canEditStock && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => loadSupplierForEdit(s.id)} className="flex-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">Editar</button>
                    <button onClick={async () => {
                      if (!window.confirm('¿Eliminar proveedor? Si tiene compras asociadas, la operación fallará.')) return;
                      try { await deleteMutation.mutateAsync(s.id); } catch (e) { console.error(e); }
                    }} className="flex-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">Eliminar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <SupplierCreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={async (payload) => {
          try {
            await createMutation.mutateAsync(payload);
          } catch (e) {
            console.error('Error creating supplier:', e);
          }
        }}
        isSubmitting={createMutation.isPending}
      />

      <SupplierEditModal
        open={showEdit}
        onClose={() => { setShowEdit(false); setEditingSupplier(null); }}
        onSubmit={async (payload) => {
          try {
            await updateMutation.mutateAsync({ id: editingSupplier.id, payload });
          } catch (e) {
            console.error('Error updating supplier:', e);
          }
        }}
        supplier={editingSupplier}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
};

export default Proveedores;
