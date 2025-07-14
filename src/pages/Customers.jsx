import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
function Customers({ currentBusiness }) {
  const { businessId } = useParams();
  const navigate = useNavigate();

  /** @type {[Array<Customer>, function]} customers - State for the list of customers displayed in the table. */
  const [customers, setCustomers] = useState([]);
  /** @type {[boolean, function]} loading - State to indicate if data is being loaded (e.g., fetching customers, deleting a customer). */
  const [loading, setLoading] = useState(true);
  /** @type {[string, function]} error - State for storing general page errors (e.g., failed to fetch, failed to delete). */
  const [error, setError] = useState('');
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
  /** @type {[boolean, function]} submittingForm - State to indicate if the add/edit customer form is currently being submitted. */
  const [submittingForm, setSubmittingForm] = useState(false);

  /**
   * Fetches customers from the API using `customerAPI.getCustomers`.
   * Can be filtered by a search `query`.
   * Updates `customers` state and handles loading/error states for customer fetching.
   * @param {string} [query] - Optional search query to filter customers.
   */
  const fetchCustomers = useCallback(async (query) => {
    const effectiveBusinessId = businessId || currentBusiness?.id;
    if (!effectiveBusinessId) {
      setError('Business ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = query ? { q: query } : {};
      const data = await customerAPI.getCustomers(effectiveBusinessId, params);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      if (isForbiddenError(err)) {
        setError('You do not have permission to view customers for this business.');
      } else {
        setError(getErrorMessage(err, 'Failed to load customers.'));
      }
      setCustomers([]); // Clear customers on error
    } finally {
      setLoading(false);
    }
  }, [businessId, currentBusiness?.id]); // Add currentBusiness?.id to dependency array

  // Effect for initial fetch and when searchTerm changes
  useEffect(() => {
    fetchCustomers(searchTerm);
  }, [searchTerm, fetchCustomers]);

  /**
   * Handles changes to the search input field.
   * Updates the `searchQuery` state with the current input value.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setSearchTerm(e.target.value); // Update search in real time
  };

  /**
   * Handles input changes for the add/edit customer form.
   * Updates the corresponding field in the `formData` state.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e - The input change event.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Shows the add customer form.
   * Resets form state (`isEditing` to false, `currentCustomer` to null, `formData` to initial),
   * clears any form or general errors, and displays the form.
   */
  const handleShowAddForm = () => {
    setIsEditing(false);
    setCurrentCustomer(null);
    setFormData(initialFormState);
    setShowForm(true);
    setFormError('');
    setError(''); // Clear general errors when showing form
  };

  /**
   * Prepares the form for editing an existing customer.
   * Sets `isEditing` to true, stores the `customer` data in `currentCustomer` and `formData`,
   * clears errors, and shows the form.
   * @param {Customer} customer - The customer object to be edited.
   */
  const handleEditClick = (customer) => {
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
    setError(''); // Clear general errors
  };

  /**
   * Handles submission of the add/edit customer form.
   * Performs validation (name required, valid email format if provided).
   * If valid, it calls either `customerAPI.createCustomer` (for adding)
   * or `customerAPI.updateCustomer` (for editing).
   * On success, it hides the form, resets form data, and refreshes the customer list.
   * Manages loading and error states specific to form submission.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const effectiveBusinessId = businessId || currentBusiness?.id;
    if (!effectiveBusinessId) {
      setFormError('Business ID is missing.');
      return;
    }
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

    setSubmittingForm(true);
    setError(''); 

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
        await customerAPI.updateCustomer(effectiveBusinessId, currentCustomer.id, finalData);
      } else {
        await customerAPI.createCustomer(effectiveBusinessId, finalData);
      }
      setShowForm(false);
      setFormData(initialFormState);
      fetchCustomers(searchTerm); // Refresh list
    } catch (err) {
      console.error('Error saving customer:', err);
      setFormError(getErrorMessage(err, 'Error saving customer.'));
    } finally {
      setSubmittingForm(false);
    }
  };

  /**
   * Handles the deletion of a customer after user confirmation.
   * Calls `customerAPI.deleteCustomer` and refreshes the customer list using the current `searchTerm`.
   * Manages loading and error states for the delete operation.
   * @param {string|number} customerId - The ID of the customer to delete.
   */
  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const effectiveBusinessId = businessId || currentBusiness?.id;
      if (!effectiveBusinessId) {
        setError('Business ID is missing.');
        return;
      }
      setLoading(true); // Indicate loading state for delete operation
      try {
        await customerAPI.deleteCustomer(effectiveBusinessId, customerId);
        // Refresh the list with the current search term
        fetchCustomers(searchTerm); 
      } catch (err) {
        console.error('Error deleting customer:', err);
        setError(getErrorMessage(err, 'Failed to delete customer.'));
        setLoading(false); // Ensure loading is false on error
      }
      // setLoading will be set to false by fetchCustomers in the success case
    }
  };

  return (
    <Layout activeSection="clients">
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
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={submittingForm}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {submittingForm ? (
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
                    disabled={submittingForm}
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
                              disabled={loading || submittingForm}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(customer.id)}
                              disabled={loading || submittingForm}
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
    </Layout>
  );
}

export default function ProtectedCustomers() {
  return (
    <PermissionGuard requiredModule="clientes" requiredAction="ver">
      <Customers />
    </PermissionGuard>
  );
}
