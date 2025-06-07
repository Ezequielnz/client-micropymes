import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { subscriptionAPI, serviceAPI, customerAPI } from '../utils/api';
import { getErrorMessage } from '../utils/errorHandler';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  Settings,
  Menu,
  X,
  ArrowLeft,
  Loader2,
  Search,
  Clock,
  CheckCircle,
  PauseCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const initialFormState = {
  cliente_id: '',
  servicio_id: '',
  nombre: '',
  descripcion: '',
  precio: '',
  tipo: 'mensual',
  dia_cobro: '',
  dia_cobro_semanal: '',
  fecha_inicio: ''
};

const subscriptionTypes = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'cuatrimestral', label: 'Cuatrimestral' },
  { value: 'anual', label: 'Anual' }
];

const frequencyOptions = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'cuatrimestral', label: 'Cuatrimestral' },
  { value: 'anual', label: 'Anual' }
];

const schedulingTypes = [
  { value: 'mismo_dia', label: 'Mismo día del mes' },
  { value: 'dia_especifico', label: 'Día específico del mes' },
  { value: 'dia_semana', label: 'Día de la semana' }
];

const weekDays = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
];

const subscriptionStatuses = [
  { value: 'activa', label: 'Active', icon: CheckCircle, color: 'text-green-600' },
  { value: 'pausada', label: 'Paused', icon: PauseCircle, color: 'text-yellow-600' },
  { value: 'cancelada', label: 'Cancelled', icon: XCircle, color: 'text-red-600' },
  { value: 'vencida', label: 'Expired', icon: AlertCircle, color: 'text-gray-600' }
];

/**
 * Subscriptions component for managing client subscriptions to services.
 */
function Subscriptions() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [subscriptions, setSubscriptions] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  
  // State for subscription form
  const [isEditing, setIsEditing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState(initialFormState);

  const fetchSubscriptions = useCallback(async () => {
    if (!businessId) {
      setError('Business ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedCustomer) params.cliente_id = selectedCustomer;
      if (selectedService) params.servicio_id = selectedService;
      if (selectedStatus) params.estado = selectedStatus;
      
      const data = await subscriptionAPI.getSubscriptions(businessId, params);
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      if (err.response?.status === 403) {
        setError('You do not have permission to view subscriptions for this business.');
      } else {
        setError(errorMessage);
      }
      console.error('Error fetching subscriptions:', err);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, [businessId, selectedCustomer, selectedService, selectedStatus]);

  const fetchServices = useCallback(async () => {
    if (!businessId) return;
    try {
      const data = await serviceAPI.getServices(businessId);
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  }, [businessId]);

  const fetchCustomers = useCallback(async () => {
    if (!businessId) return;
    try {
      const data = await customerAPI.getCustomers(businessId);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  }, [businessId]);

  useEffect(() => {
    fetchServices();
    fetchCustomers();
  }, [fetchServices, fetchCustomers]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSubscriptionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!businessId) {
      setFormError('Business ID is missing.');
      return;
    }
    
    // Validación básica
    if (!subscriptionForm.cliente_id || !subscriptionForm.nombre || !subscriptionForm.precio || !subscriptionForm.fecha_inicio || !subscriptionForm.tipo) {
      setFormError('Please fill all required fields.');
      return;
    }

    // Validación específica según el tipo
    if (subscriptionForm.tipo === 'semanal') {
      if (!subscriptionForm.dia_cobro_semanal) {
        setFormError('Please select the day of the week for weekly billing.');
        return;
      }
    } else {
      if (!subscriptionForm.dia_cobro) {
        setFormError('Please enter the day of the month for billing.');
        return;
      }
    }

    setLoading(true);
    try {
      // Limpiar y preparar los datos
      const cleanedData = {
        cliente_id: subscriptionForm.cliente_id,
        nombre: subscriptionForm.nombre.trim(),
        descripcion: subscriptionForm.descripcion.trim() || null,
        precio: parseFloat(subscriptionForm.precio),
        tipo: subscriptionForm.tipo,
        servicio_id: subscriptionForm.servicio_id || null,
        fecha_inicio: subscriptionForm.fecha_inicio,
      };

      // Agregar campos de cobro según el tipo
      if (subscriptionForm.tipo === 'semanal') {
        cleanedData.dia_cobro_semanal = parseInt(subscriptionForm.dia_cobro_semanal);
        cleanedData.dia_cobro = null;
      } else {
        cleanedData.dia_cobro = parseInt(subscriptionForm.dia_cobro);
        cleanedData.dia_cobro_semanal = null;
      }

      // Filtrar valores null para no enviarlos
      const finalData = Object.fromEntries(
        Object.entries(cleanedData).filter(([key, value]) => value !== null)
      );

      if (isEditing && currentSubscription) {
        await subscriptionAPI.updateSubscription(businessId, currentSubscription.id, finalData);
      } else {
        await subscriptionAPI.createSubscription(businessId, finalData);
      }

      await fetchSubscriptions();
      setShowForm(false);
      setSubscriptionForm(initialFormState);
      setIsEditing(false);
      setCurrentSubscription(null);
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Error saving subscription');
      setFormError(errorMessage);
      console.error('Error saving subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subscription) => {
    setCurrentSubscription(subscription);
    setSubscriptionForm({
      cliente_id: subscription.cliente_id || '',
      servicio_id: subscription.servicio_id || '',
      nombre: subscription.nombre || '',
      descripcion: subscription.descripcion || '',
      precio: subscription.precio?.toString() || '',
      tipo: subscription.tipo || 'mensual',
      dia_cobro: subscription.dia_cobro?.toString() || '',
      dia_cobro_semanal: subscription.dia_cobro_semanal?.toString() || '',
      fecha_inicio: subscription.fecha_inicio ? subscription.fecha_inicio.split('T')[0] : ''
    });
    setIsEditing(true);
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    setLoading(true);
    try {
      await subscriptionAPI.deleteSubscription(businessId, subscriptionId);
      await fetchSubscriptions();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Error deleting subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (subscriptionId, newStatus) => {
    setLoading(true);
    try {
      await subscriptionAPI.updateSubscriptionStatus(businessId, subscriptionId, newStatus);
      await fetchSubscriptions();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Error updating subscription status:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setShowForm(false);
    setSubscriptionForm(initialFormState);
    setIsEditing(false);
    setCurrentSubscription(null);
    setFormError('');
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.nombre} ${customer.apellido}` : 'Unknown Customer';
  };

  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.nombre : 'No service';
  };

  const getStatusInfo = (status) => {
    return subscriptionStatuses.find(s => s.value === status) || subscriptionStatuses[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredSubscriptions = subscriptions.filter(subscription =>
    subscription.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCustomerName(subscription.cliente_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getServiceName(subscription.servicio_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/business/${businessId}`)}
                className="flex items-center space-x-2 bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 border-gray-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Panel</span>
              </Button>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Subscription</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All customers</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.nombre} {customer.apellido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All services</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              {subscriptionStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Subscriptions Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSubscriptions.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCustomer || selectedService || selectedStatus
                    ? "No subscriptions match your current filters." 
                    : "Get started by adding your first subscription."}
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subscription
                </Button>
              </div>
            ) : (
              filteredSubscriptions.map((subscription) => {
                const statusInfo = getStatusInfo(subscription.estado);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <Card key={subscription.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{subscription.nombre}</CardTitle>
                          <CardDescription className="mt-1">
                            {getCustomerName(subscription.cliente_id)}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(subscription)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(subscription.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {subscription.descripcion && (
                        <p className="text-sm text-gray-600 mb-3">{subscription.descripcion}</p>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Service:</span>
                          <span className="text-sm font-medium">
                            {getServiceName(subscription.servicio_id)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Price:</span>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-600">
                              ${subscription.precio?.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-500">
                              /{subscription.tipo === 'semanal' ? 'week' : 
                                subscription.tipo === 'mensual' ? 'month' :
                                subscription.tipo === 'trimestral' ? 'quarter' :
                                subscription.tipo === 'cuatrimestral' ? '4 months' : 'year'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Billing:</span>
                          <span className="text-sm font-medium capitalize">
                            {subscription.tipo === 'semanal' 
                              ? `${weekDays.find(d => d.value === subscription.dia_cobro_semanal)?.label || 'Not set'}`
                              : `Day ${subscription.dia_cobro || 'Not set'} of ${subscription.tipo === 'mensual' ? 'month' : subscription.tipo}`
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Status:</span>
                          <div className="flex items-center space-x-1">
                            <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                            <Badge variant={subscription.estado === 'activa' ? "default" : "secondary"}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Start Date:</span>
                          <span className="text-sm font-medium">
                            {formatDate(subscription.fecha_inicio)}
                          </span>
                        </div>
                        {subscription.fecha_proximo_pago && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Next Payment:</span>
                            <span className="text-sm font-medium">
                              {formatDate(subscription.fecha_proximo_pago)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Status Actions */}
                      <div className="mt-4 pt-3 border-t">
                        <div className="flex flex-wrap gap-2">
                          {subscription.estado === 'activa' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(subscription.id, 'pausada')}
                              className="text-yellow-600 hover:text-yellow-700"
                            >
                              <PauseCircle className="h-3 w-3 mr-1" />
                              Pause
                            </Button>
                          )}
                          {subscription.estado === 'pausada' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(subscription.id, 'activa')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Activate
                            </Button>
                          )}
                          {(subscription.estado === 'activa' || subscription.estado === 'pausada') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(subscription.id, 'cancelada')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Subscription Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {isEditing ? 'Editar Suscripción' : 'Agregar Nueva Suscripción'}
              </h2>
              
              {formError && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{formError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="cliente_id" className="text-gray-700">Cliente *</Label>
                  <Select
                    value={subscriptionForm.cliente_id}
                    onValueChange={(value) => setSubscriptionForm(prev => ({ ...prev, cliente_id: value }))}
                  >
                    <SelectTrigger className="text-gray-900">
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.nombre} {customer.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="servicio_id" className="text-gray-700">Servicio (Opcional)</Label>
                    <Select
                      value={subscriptionForm.servicio_id}
                      onValueChange={(value) => setSubscriptionForm(prev => ({ ...prev, servicio_id: value }))}
                    >
                      <SelectTrigger className="text-gray-900">
                        <SelectValue placeholder="Selecciona un servicio base" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin servicio base</SelectItem>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tipo" className="text-gray-700">Tipo de Suscripción *</Label>
                    <Select
                      value={subscriptionForm.tipo}
                      onValueChange={(value) => setSubscriptionForm(prev => ({ 
                        ...prev, 
                        tipo: value,
                        // Limpiar campos de cobro cuando cambia el tipo
                        dia_cobro: '',
                        dia_cobro_semanal: ''
                      }))}
                    >
                      <SelectTrigger className="text-gray-900">
                        <SelectValue placeholder="Selecciona la frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        {subscriptionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="nombre" className="text-gray-700">Nombre de la Suscripción *</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={subscriptionForm.nombre}
                    onChange={handleFormChange}
                    required
                    className="text-gray-900"
                    placeholder="Ej: Plan Premium, Membresía Básica, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion" className="text-gray-700">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    value={subscriptionForm.descripcion}
                    onChange={handleFormChange}
                    rows={3}
                    className="text-gray-900"
                    placeholder="Describe qué incluye esta suscripción..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="precio" className="text-gray-700">
                      Precio *
                      {subscriptionForm.tipo && (
                        <span className="text-sm text-gray-500 ml-1">
                          (por {subscriptionForm.tipo === 'semanal' ? 'semana' : 
                               subscriptionForm.tipo === 'mensual' ? 'mes' :
                               subscriptionForm.tipo === 'trimestral' ? 'trimestre' :
                               subscriptionForm.tipo === 'cuatrimestral' ? 'cuatrimestre' : 'año'})
                        </span>
                      )}
                    </Label>
                    <Input
                      id="precio"
                      name="precio"
                      type="number"
                      step="0.01"
                      min="0"
                      value={subscriptionForm.precio}
                      onChange={handleFormChange}
                      required
                      className="text-gray-900"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fecha_inicio" className="text-gray-700">Fecha de Inicio *</Label>
                    <Input
                      id="fecha_inicio"
                      name="fecha_inicio"
                      type="date"
                      value={subscriptionForm.fecha_inicio}
                      onChange={handleFormChange}
                      required
                      className="text-gray-900"
                    />
                  </div>
                </div>

                {/* Configuración de cobro dinámico según el tipo */}
                {subscriptionForm.tipo === 'semanal' && (
                  <div>
                    <Label htmlFor="dia_cobro_semanal" className="text-gray-700">¿Qué día de la semana se cobrará? *</Label>
                    <Select
                      value={subscriptionForm.dia_cobro_semanal}
                      onValueChange={(value) => setSubscriptionForm(prev => ({ ...prev, dia_cobro_semanal: value }))}
                    >
                      <SelectTrigger className="text-gray-900">
                        <SelectValue placeholder="Selecciona el día de la semana" />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {subscriptionForm.tipo && subscriptionForm.tipo !== 'semanal' && (
                  <div>
                    <Label htmlFor="dia_cobro" className="text-gray-700">
                      ¿Qué día del mes se cobrará? *
                      <span className="text-sm text-gray-500 block">
                        Ingresa un número del 1 al 31. Si el mes no tiene ese día, se cobrará el último día del mes.
                      </span>
                    </Label>
                    <Input
                      id="dia_cobro"
                      name="dia_cobro"
                      type="number"
                      min="1"
                      max="31"
                      value={subscriptionForm.dia_cobro}
                      onChange={handleFormChange}
                      required
                      className="text-gray-900"
                      placeholder="Ej: 15 (día 15 de cada mes/trimestre/cuatrimestre/año)"
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {isEditing ? 'Actualizar Suscripción' : 'Agregar Suscripción'}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subscriptions; 