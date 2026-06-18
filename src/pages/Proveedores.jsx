import React, { useState, useCallback, useMemo } from 'react';
import { useBusinessContext } from '../contexts/BusinessContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supplierAPI } from '../utils/api';
import { getErrorMessage, isForbiddenError } from '../utils/errorHandler';
import { useUserPermissions } from '../hooks/useUserPermissions';
import UniversalImportModal from '../components/UniversalImportModal';
import '../styles/responsive-overrides.css';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  AlertTriangle,
  Briefcase,
  Loader2,
  Upload
} from 'lucide-react';

const Proveedores = () => {
  const { currentBusiness } = useBusinessContext();
  const queryClient = useQueryClient();
  const businessId = currentBusiness?.id;

  const { canView, canEdit, isLoading: permissionsLoading } = useUserPermissions(businessId);
  const canViewStock = useMemo(() => canView('stock'), [canView]);
  const canEditStock = useMemo(() => canEdit('stock'), [canEdit]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const initialFormState = useMemo(() => ({
    razon_social: '',
    documento_tipo: '',
    documento_numero: '',
    condicion_iva: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    pais: '',
    condiciones_pago: '',
    observaciones: '',
    estado: ''
  }), []);

  const [formData, setFormData] = useState(initialFormState);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [formError, setFormError] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    data: suppliers = [],
    isLoading: loading,
    error: queryError
  } = useQuery({
    queryKey: ['suppliers', businessId, searchTerm],
    queryFn: async () => {
      if (!businessId) return [];
      const params = searchTerm ? { q: searchTerm } : {};
      return await supplierAPI.getSuppliers(businessId, params);
    },
    enabled: !!businessId && !!currentBusiness && canViewStock,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (supplierData) => {
      if (!businessId) throw new Error('Business ID is missing');
      return await supplierAPI.createSupplier(businessId, supplierData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers', businessId]);
      setShowForm(false);
      setFormData(initialFormState);
      setFormError('');
    },
    onError: (error) => {
      console.error('Error creating supplier:', error);
      setFormError(getErrorMessage(error, 'Error creating supplier.'));
    }
  });

  const updateSupplierMutation = useMutation({
    mutationFn: async ({ supplierId, supplierData }) => {
      if (!businessId) throw new Error('Business ID is missing');
      return await supplierAPI.updateSupplier(businessId, supplierId, supplierData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers', businessId]);
      setShowForm(false);
      setFormData(initialFormState);
      setCurrentSupplier(null);
      setIsEditing(false);
      setFormError('');
    },
    onError: (error) => {
      console.error('Error updating supplier:', error);
      setFormError(getErrorMessage(error, 'Error updating supplier.'));
    }
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: (id) => supplierAPI.delete(businessId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores', businessId] });
      setSuccessMessage('Proveedor eliminado correctamente.');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setTimeout(() => setError(null), 5000);
    }
  });

  const handleImportSuccess = (success, errors) => {
    queryClient.invalidateQueries({ queryKey: ['proveedores', businessId] });
    if (success > 0 || errors > 0) {
      setSuccessMessage(`Importación finalizada: ${success} creados, ${errors} errores.`);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  const error = React.useMemo(() => {
    if (queryError) {
      if (isForbiddenError(queryError)) {
        return 'No tienes permiso para ver proveedores.';
      }
      return getErrorMessage(queryError, 'Error al cargar proveedores.');
    }
    return '';
  }, [queryError]);

  const isLoading = React.useMemo(() => {
    return loading || permissionsLoading ||
           createSupplierMutation.isPending || 
           updateSupplierMutation.isPending || 
           deleteSupplierMutation.isPending;
  }, [loading, permissionsLoading, createSupplierMutation.isPending, updateSupplierMutation.isPending, deleteSupplierMutation.isPending]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setSearchTerm(e.target.value);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleShowAddForm = useCallback(() => {
    setIsEditing(false);
    setCurrentSupplier(null);
    setFormData(initialFormState);
    setShowForm(true);
    setFormError('');
  }, [initialFormState]);

  const handleEditClick = useCallback((supplier) => {
    setIsEditing(true);
    setCurrentSupplier(supplier);
    setFormData({
      razon_social: supplier.razon_social || supplier.nombre || '',
      documento_tipo: supplier.documento_tipo || '',
      documento_numero: supplier.documento_numero || supplier.cuit_cuil || '',
      condicion_iva: supplier.condicion_iva || '',
      email: supplier.email || '',
      telefono: supplier.telefono || '',
      direccion: supplier.direccion || '',
      ciudad: supplier.ciudad || '',
      provincia: supplier.provincia || '',
      pais: supplier.pais || '',
      condiciones_pago: supplier.condiciones_pago || '',
      observaciones: supplier.observaciones || '',
      estado: supplier.estado || ''
    });
    setShowForm(true);
    setFormError('');
  }, []);

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.razon_social) {
      setFormError('Razón Social es requerido.');
      return;
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError('Email es inválido.');
      return;
    }

    try {
      const cleanedData = {
        razon_social: formData.razon_social.trim(),
        documento_tipo: formData.documento_tipo && formData.documento_tipo.trim() ? formData.documento_tipo.trim() : null,
        documento_numero: formData.documento_numero && formData.documento_numero.trim() ? formData.documento_numero.trim() : null,
        condicion_iva: formData.condicion_iva && formData.condicion_iva.trim() ? formData.condicion_iva.trim() : null,
        email: formData.email && formData.email.trim() ? formData.email.trim() : null,
        telefono: formData.telefono && formData.telefono.trim() ? formData.telefono.trim() : null,
        direccion: formData.direccion && formData.direccion.trim() ? formData.direccion.trim() : null,
        ciudad: formData.ciudad && formData.ciudad.trim() ? formData.ciudad.trim() : null,
        provincia: formData.provincia && formData.provincia.trim() ? formData.provincia.trim() : null,
        pais: formData.pais && formData.pais.trim() ? formData.pais.trim() : null,
        condiciones_pago: formData.condiciones_pago && formData.condiciones_pago.trim() ? formData.condiciones_pago.trim() : null,
        observaciones: formData.observaciones && formData.observaciones.trim() ? formData.observaciones.trim() : null,
        estado: formData.estado && formData.estado.trim() ? formData.estado.trim() : null,
      };

      const finalData = Object.fromEntries(
        Object.entries(cleanedData).filter(([, value]) => value !== null)
      );

      if (isEditing && currentSupplier) {
        await updateSupplierMutation.mutateAsync({ 
          supplierId: currentSupplier.id, 
          supplierData: finalData 
        });
      } else {
        await createSupplierMutation.mutateAsync(finalData);
      }
    } catch (err) {
      console.error('Form submission error:', err);
    }
  }, [formData, isEditing, currentSupplier, createSupplierMutation, updateSupplierMutation]);

  const handleDelete = useCallback(async (supplierId) => {
    if (window.confirm('¿Eliminar proveedor? Si tiene compras asociadas, la operación fallará.')) {
      try {
        await deleteSupplierMutation.mutateAsync(supplierId);
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  }, [deleteSupplierMutation]);

  if (!currentBusiness) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Proveedores
          </h1>
          <p className="text-gray-600">
            Administra los proveedores de tu negocio
          </p>
        </div>
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No hay negocio seleccionado. Por favor selecciona un negocio desde el menú superior.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando permisos...</span>
      </div>
    );
  }

  if (!canViewStock) {
    return (
      <div className="p-8">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para ver proveedores.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Proveedores
        </h1>
        <p className="text-gray-600">
          Administra los proveedores de tu negocio
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            {successMessage && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}
          </div>
          {canEditStock && (
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowImportModal(true)}
                variant="outline"
                className="hover:bg-gray-100"
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button 
                onClick={handleShowAddForm}
                className="hover:opacity-90"
                style={{ backgroundColor: '#28a745', color: 'white', border: 'none' }}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <UniversalImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        entityType="proveedores"
        businessId={businessId}
        onImportSuccess={handleImportSuccess}
      />

      {/* Search */}
      <Card className="border border-gray-200 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-blue-600" />
            Buscar Proveedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium text-gray-700">
              Buscar por razón social o documento
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Buscar proveedores..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Form */}
      {showForm && (
        <Card className="border border-gray-200 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-blue-600" />
              {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razon_social" className="text-sm font-medium text-gray-700">
                    Razón Social <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="razon_social"
                    name="razon_social"
                    type="text"
                    value={formData.razon_social}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento_tipo" className="text-sm font-medium text-gray-700">
                    Tipo de Documento
                  </Label>
                  <select
                    id="documento_tipo"
                    name="documento_tipo"
                    value={formData.documento_tipo}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900"
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="CUIT">CUIT</option>
                    <option value="CUIL">CUIL</option>
                    <option value="DNI">DNI</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento_numero" className="text-sm font-medium text-gray-700">
                    Número de Documento
                  </Label>
                  <Input
                    id="documento_numero"
                    name="documento_numero"
                    type="text"
                    value={formData.documento_numero}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condicion_iva" className="text-sm font-medium text-gray-700">
                    Condición frente al IVA
                  </Label>
                  <select
                    id="condicion_iva"
                    name="condicion_iva"
                    value={formData.condicion_iva}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900"
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Responsable Inscripto">Responsable Inscripto</option>
                    <option value="Monotributista">Monotributista</option>
                    <option value="Exento">Exento</option>
                    <option value="Consumidor Final">Consumidor Final</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion" className="text-sm font-medium text-gray-700">
                    Dirección
                  </Label>
                  <Input
                    id="direccion"
                    name="direccion"
                    type="text"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ciudad" className="text-sm font-medium text-gray-700">
                    Ciudad
                  </Label>
                  <Input
                    id="ciudad"
                    name="ciudad"
                    type="text"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provincia" className="text-sm font-medium text-gray-700">
                    Provincia
                  </Label>
                  <Input
                    id="provincia"
                    name="provincia"
                    type="text"
                    value={formData.provincia}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pais" className="text-sm font-medium text-gray-700">
                    País
                  </Label>
                  <Input
                    id="pais"
                    name="pais"
                    type="text"
                    value={formData.pais}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condiciones_pago" className="text-sm font-medium text-gray-700">
                    Condiciones de pago
                  </Label>
                  <Input
                    id="condiciones_pago"
                    name="condiciones_pago"
                    type="text"
                    value={formData.condiciones_pago}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-sm font-medium text-gray-700">
                    Estado
                  </Label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900"
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observaciones" className="text-sm font-medium text-gray-700">
                    Observaciones
                  </Label>
                  <Input
                    id="observaciones"
                    name="observaciones"
                    type="text"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="hover:opacity-90"
                  style={{ backgroundColor: '#28a745', color: 'white', border: 'none' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEditing ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
                      {isEditing ? 'Actualizar Proveedor' : 'Crear Proveedor'}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setFormError('');
                  }}
                  disabled={isLoading}
                  className="hover:opacity-90"
                  style={{ backgroundColor: '#6c757d', color: 'white', border: 'none' }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Suppliers List */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Lista de Proveedores
            {suppliers.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {suppliers.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Cargando proveedores...</span>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'No se encontraron proveedores que coincidan con tu búsqueda.' : 'No hay proveedores registrados aún.'}
              </p>
              {!searchTerm && canEditStock && (
                <Button 
                  onClick={handleShowAddForm}
                  className="mt-4 hover:opacity-90"
                  style={{ backgroundColor: '#28a745', color: 'white', border: 'none' }}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Proveedor
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Razón Social</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Teléfono</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Documento</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Ubicación</th>
                    {canEditStock && (
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map(supplier => (
                    <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {supplier.razon_social || supplier.nombre}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {supplier.email || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {supplier.telefono || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {supplier.documento_tipo || supplier.documento_numero || supplier.cuit_cuil
                          ? `${supplier.documento_tipo || 'CUIT'}: ${supplier.documento_numero || supplier.cuit_cuil || ''}` 
                          : 'N/A'
                        }
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {[supplier.ciudad, supplier.provincia, supplier.pais].filter(Boolean).join(', ') || 'N/A'}
                      </td>
                      {canEditStock && (
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEditClick(supplier)}
                              disabled={isLoading}
                              className="hover:opacity-90"
                              style={{ backgroundColor: '#17a2b8', color: 'white', border: 'none' }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDelete(supplier.id)}
                              disabled={isLoading}
                              className="hover:opacity-90"
                              style={{ backgroundColor: '#dc3545', color: 'white', border: 'none' }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Proveedores;
