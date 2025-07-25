import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBusinessContext } from '../contexts/BusinessContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { customerAPI, authAPI } from '../utils/api';
import { getErrorMessage, isForbiddenError } from '../utils/errorHandler';
import PermissionGuard from '../components/PermissionGuard';
import Layout from '../components/Layout';
import '../styles/responsive-overrides.css';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  AlertTriangle,
  User,
  Loader2
} from 'lucide-react';

/**
 * @typedef {object} Customer
 * @property {string|number} id - The unique identifier for the customer.
 * @property {string} nombre - The customer's name.
 * @property {string} [apellido] - The customer's last name.
 * @property {string} [email] - The customer's email address.
 * @property {string} [telefono] - The customer's phone number (optional).
 * @property {string} [direccion] - The customer's physical address (optional).
 * @property {string} [documento_tipo] - The customer's document type (optional).
 * @property {string} [documento_numero] - The customer's document number (optional).
 */

/**
 * @typedef {object} FormDataCustomer
 * @property {string} nombre - Customer's name.
 * @property {string} apellido - Customer's last name.
 * @property {string} email - Customer's email.
 * @property {string} telefono - Customer's phone number.
 * @property {string} direccion - Customer's address.
 * @property {string} documento_tipo - Customer's document type.
 * @property {string} documento_numero - Customer's document number.
 */

/**
 * Customers component for managing customer data.
 * Allows users to view a list of customers, search for specific customers,
 * add new customers, edit existing ones, and delete customers.
 * Handles API interactions for these CRUD operations and manages related state
 * (loading, errors, form data).
 */
function Customers() {
  const { currentBusiness } = useBusinessContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const businessId = currentBusiness?.id;

  /** @type {[string, function]} searchQuery - State for the value currently in the search input field. */
  const [searchQuery, setSearchQuery] = useState('');
  /** @type {[string, function]} searchTerm - State for the actual search term submitted and used for fetching filtered customers. */
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  /** @type {FormDataCustomer} */
  const initialFormState = { 
    nombre: '', 
    apellido: '', 
    email: '', 
    telefono: '', 
    direccion: '', 
    documento_tipo: '', 
    documento_numero: '' 
  };
  /** @type {[FormDataCustomer, function]} formData - State for the add/edit customer form inputs. */
  const [formData, setFormData] = useState(initialFormState);
  /** @type {[boolean, function]} showForm - State to control the visibility of the add/edit customer form. */
  const [showForm, setShowForm] = useState(false);
  /** @type {[boolean, function]} isEditing - State to determine if the form is in 'edit' mode (true) or 'add' mode (false). */
  const [isEditing, setIsEditing] = useState(false);
  /** @type {[Customer|null, function]} currentCustomer - State to store the customer object currently being edited. Null when adding. */
  const [currentCustomer, setCurrentCustomer] = useState(null);
  /** @type {[string, function]} formError - State for storing errors specific to the add/edit customer form (e.g., validation errors). */
  const [formError, setFormError] = useState('');

  // ✅ OPTIMIZED: React Query for customers with smart caching
  const { 
    data: customers = [], 
    isLoading: loading, 
    error: queryError,
    refetch: refetchCustomers
  } = useQuery({
    queryKey: ['customers', businessId, searchTerm],
    queryFn: async () => {
      if (!businessId) return [];
      const params = searchTerm ? { q: searchTerm } : {};
      return await customerAPI.getCustomers(businessId, params);
    },
    enabled: !!businessId && !!currentBusiness, // Only fetch when we have a valid business
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // ✅ OPTIMIZED: Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData) => {
      if (!businessId) throw new Error('Business ID is missing');
      return await customerAPI.createCustomer(businessId, customerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customers', businessId]);
      setShowForm(false);
      setFormData(initialFormState);
      setFormError('');
    },
    onError: (error) => {
      console.error('Error creating customer:', error);
      setFormError(getErrorMessage(error, 'Error creating customer.'));
    }
  });

  // ✅ OPTIMIZED: Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ customerId, customerData }) => {
      if (!businessId) throw new Error('Business ID is missing');
      return await customerAPI.updateCustomer(businessId, customerId, customerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customers', businessId]);
      setShowForm(false);
      setFormData(initialFormState);
      setCurrentCustomer(null);
      setIsEditing(false);
      setFormError('');
    },
    onError: (error) => {
      console.error('Error updating customer:', error);
      setFormError(getErrorMessage(error, 'Error updating customer.'));
    }
  });

  // ✅ OPTIMIZED: Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId) => {
      if (!businessId) throw new Error('Business ID is missing');
      return await customerAPI.deleteCustomer(businessId, customerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customers', businessId]);
    },
    onError: (error) => {
      console.error('Error deleting customer:', error);
      // Could add toast notification here
    }
  });

  // ✅ OPTIMIZED: Memoized error handling
  const error = React.useMemo(() => {
    if (queryError) {
      if (isForbiddenError(queryError)) {
        return 'You do not have permission to view customers for this business.';
      }
      return getErrorMessage(queryError, 'Failed to load customers.');
    }
    return '';
  }, [queryError]);

  // ✅ OPTIMIZED: Memoized loading state
  const isLoading = React.useMemo(() => {
    return loading || 
           createCustomerMutation.isPending || 
           updateCustomerMutation.isPending || 
           deleteCustomerMutation.isPending;
  }, [loading, createCustomerMutation.isPending, updateCustomerMutation.isPending, deleteCustomerMutation.isPending]);

  /**
   * Handles changes to the search input field.
   * Updates the `searchQuery` state with the current input value.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setSearchTerm(e.target.value); // Update search in real time
  }, []);

  /**
   * Handles input changes for the add/edit customer form.
   * Updates the corresponding field in the `formData` state.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e - The input change event.
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Shows the add customer form.
   * Resets form state (`isEditing` to false, `currentCustomer` to null, `formData` to initial),
   * clears any form or general errors, and displays the form.
   */
  const handleShowAddForm = useCallback(() => {
    setIsEditing(false);
    setCurrentCustomer(null);
    setFormData(initialFormState);
    setShowForm(true);
    setFormError('');
  }, [initialFormState]);

  /**
   * Prepares the form for editing an existing customer.
   * Sets `isEditing` to true, stores the `customer` data in `currentCustomer` and `formData`,
   * clears errors, and shows the form.
   * @param {Customer} customer - The customer object to be edited.
   */
  const handleEditClick = useCallback((customer) => {
    setIsEditing(true);
    setCurrentCustomer(customer);
    setFormData({
      nombre: customer.nombre || '',
      apellido: customer.apellido || '',
      email: customer.email || '',
      telefono: customer.telefono || '', // Handle if phone or address can be null
      direccion: customer.direccion || '',
      documento_tipo: customer.documento_tipo || '',
      documento_numero: customer.documento_numero || '',
    });
    setShowForm(true);
    setFormError('');
  }, []);

  /**
   * Handles submission of the add/edit customer form.
   * Performs validation (name required, valid email format if provided).
   * If valid, it calls either `createCustomerMutation` (for adding)
   * or `updateCustomerMutation` (for editing).
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nombre) {
      setFormError('Name is required.');
      return;
    }
    if (!formData.apellido) {
      setFormError('Last name is required.');
      return;
    }
    // Basic email validation (only if email is provided)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError('Email address is invalid.');
      return;
    }

    try {
      // Clean the form data - convert empty strings to null for optional fields
      const cleanedData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email && formData.email.trim() ? formData.email.trim() : null,
        telefono: formData.telefono && formData.telefono.trim() ? formData.telefono.trim() : null,
        direccion: formData.direccion && formData.direccion.trim() ? formData.direccion.trim() : null,
        documento_tipo: formData.documento_tipo && formData.documento_tipo.trim() ? formData.documento_tipo.trim() : null,
        documento_numero: formData.documento_numero && formData.documento_numero.trim() ? formData.documento_numero.trim() : null,
      };

      // Remove null values to avoid sending them to the backend
      const finalData = Object.fromEntries(
        Object.entries(cleanedData).filter(([key, value]) => value !== null)
      );

      if (isEditing && currentCustomer) {
        await updateCustomerMutation.mutateAsync({ 
          customerId: currentCustomer.id, 
          customerData: finalData 
        });
      } else {
        await createCustomerMutation.mutateAsync(finalData);
      }
    } catch (err) {
      // Error handling is done in the mutation onError callbacks
      console.error('Form submission error:', err);
    }
  }, [formData, isEditing, currentCustomer, createCustomerMutation, updateCustomerMutation]);

  /**
   * Handles the deletion of a customer after user confirmation.
   * Calls `deleteCustomerMutation` to delete the customer.
   * @param {string|number} customerId - The ID of the customer to delete.
   */
  const handleDelete = useCallback(async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomerMutation.mutateAsync(customerId);
      } catch (err) {
        // Error handling is done in the mutation onError callback
        console.error('Delete error:', err);
      }
    }
  }, [deleteCustomerMutation]);

  // ✅ OPTIMIZED: Early return for missing business
  if (!currentBusiness) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Clientes
          </h1>
          <p className="text-gray-600">
            Administra la base de clientes de tu negocio
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Clientes
        </h1>
        <p className="text-gray-600">
          Administra la base de clientes de tu negocio
        </p>
      </div>

      {/* Action Button */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div></div>
          <div className="flex gap-3">
            <Button 
              onClick={handleShowAddForm}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Search */}
      <Card className="border border-gray-200 shadow-sm mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5 text-blue-600" />
            Buscar Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium text-gray-700">
              Buscar por nombre, apellido, email o documento
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Buscar clientes..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Form */}
      {showForm && (
        <Card className="border border-gray-200 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-600" />
              {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
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
                  <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido" className="text-sm font-medium text-gray-700">
                    Apellido <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="apellido"
                    name="apellido"
                    type="text"
                    value={formData.apellido}
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
                  <Input
                    id="documento_tipo"
                    name="documento_tipo"
                    type="text"
                    value={formData.documento_tipo}
                    onChange={handleInputChange}
                    placeholder="DNI, CUIT, etc."
                    className="w-full"
                    disabled={isLoading}
                  />
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
              </div>
              <div className="space-y-2">
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
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEditing ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
                      {isEditing ? 'Actualizar Cliente' : 'Crear Cliente'}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormError('');
                  }}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Customers List */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-blue-600" />
            Lista de Clientes
            {customers.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {customers.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Cargando clientes...</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'No se encontraron clientes que coincidan con tu búsqueda.' : 'No hay clientes registrados aún.'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={handleShowAddForm}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nombre</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Teléfono</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Documento</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Dirección</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {customer.nombre} {customer.apellido}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {customer.email || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {customer.telefono || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {customer.documento_tipo && customer.documento_numero 
                          ? `${customer.documento_tipo}: ${customer.documento_numero}` 
                          : 'N/A'
                        }
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {customer.direccion || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(customer)}
                            disabled={isLoading}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(customer.id)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
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

export default function ProtectedCustomers() {
  return (
    <Layout activeSection="customers">
      <PermissionGuard requiredModule="clientes" requiredAction="ver">
        <Customers />
      </PermissionGuard>
    </Layout>
  );
}
