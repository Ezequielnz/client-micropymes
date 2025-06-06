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
import { subscriptionAPI, serviceAPI, clientAPI } from '../utils/api';
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
  precio_mensual: '',
  tipo: 'mensual',
  fecha_inicio: '',
  fecha_fin: '',
  fecha_proximo_pago: ''
};

const subscriptionTypes = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' }
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
  const [clients, setClients] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
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
      if (selectedClient) params.cliente_id = selectedClient;
      if (selectedService) params.servicio_id = selectedService;
      if (selectedStatus) params.estado = selectedStatus;
      
      const data = await subscriptionAPI.getSubscriptions(businessId, params);
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error fetching subscriptions';
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
  }, [businessId, selectedClient, selectedService, selectedStatus]);

  const fetchServices = useCallback(async () => {
    if (!businessId) return;
    try {
      const data = await serviceAPI.getServices(businessId);
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  }, [businessId]);

  const fetchClients = useCallback(async () => {
    if (!businessId) return;
    try {
      const data = await clientAPI.getClients(businessId);
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  }, [businessId]);

  useEffect(() => {
    fetchServices();
    fetchClients();
  }, [fetchServices, fetchClients]);

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
    if (!subscriptionForm.cliente_id || !subscriptionForm.servicio_id || !subscriptionForm.nombre || !subscriptionForm.precio_mensual || !subscriptionForm.fecha_inicio) {
      setFormError('Please fill all required fields.');
      return;
    }

    setLoading(true);
    try {
      const subscriptionData = { 
        cliente_id: subscriptionForm.cliente_id,
        servicio_id: subscriptionForm.servicio_id,
        nombre: subscriptionForm.nombre.trim(), 
        descripcion: subscriptionForm.descripcion.trim(), 
        precio_mensual: parseFloat(subscriptionForm.precio_mensual), 
        tipo: subscriptionForm.tipo,
        fecha_inicio: subscriptionForm.fecha_inicio,
        fecha_fin: subscriptionForm.fecha_fin || null,
        fecha_proximo_pago: subscriptionForm.fecha_proximo_pago || null
      };

      if (isEditing && currentSubscription) {
        await subscriptionAPI.updateSubscription(businessId, currentSubscription.id, subscriptionData);
      } else {
        await subscriptionAPI.createSubscription(businessId, subscriptionData);
      }

      await fetchSubscriptions();
      setShowForm(false);
      setSubscriptionForm(initialFormState);
      setIsEditing(false);
      setCurrentSubscription(null);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error saving subscription';
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
      precio_mensual: subscription.precio_mensual?.toString() || '',
      tipo: subscription.tipo || 'mensual',
      fecha_inicio: subscription.fecha_inicio ? subscription.fecha_inicio.split('T')[0] : '',
      fecha_fin: subscription.fecha_fin ? subscription.fecha_fin.split('T')[0] : '',
      fecha_proximo_pago: subscription.fecha_proximo_pago ? subscription.fecha_proximo_pago.split('T')[0] : ''
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
      const errorMessage = err.response?.data?.detail || err.message || 'Error deleting subscription';
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
      const errorMessage = err.response?.data?.detail || err.message || 'Error updating subscription status';
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

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.nombre} ${client.apellido}` : 'Unknown Client';
  };

  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.nombre : 'Unknown Service';
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
    getClientName(subscription.cliente_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.nombre} {client.apellido}
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
                  {searchTerm || selectedClient || selectedService || selectedStatus
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
                            {getClientName(subscription.cliente_id)}
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
                          <span className="text-sm text-gray-500">Monthly Price:</span>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-600">
                              ${subscription.precio_mensual?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Type:</span>
                          <span className="text-sm font-medium capitalize">
                            {subscription.tipo}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.nombre} {client.apellido}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="servicio_id" className="text-gray-700">Servicio *</Label>
                    <Select
                      value={subscriptionForm.servicio_id}
                      onValueChange={(value) => setSubscriptionForm(prev => ({ ...prev, servicio_id: value }))}
                    >
                      <SelectTrigger className="text-gray-900">
                        <SelectValue placeholder="Selecciona un servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.nombre}
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
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="precio_mensual" className="text-gray-700">Precio Mensual *</Label>
                    <Input
                      id="precio_mensual"
                      name="precio_mensual"
                      type="number"
                      step="0.01"
                      min="0"
                      value={subscriptionForm.precio_mensual}
                      onChange={handleFormChange}
                      required
                      className="text-gray-900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipo" className="text-gray-700">Tipo de Suscripción</Label>
                    <Select
                      value={subscriptionForm.tipo}
                      onValueChange={(value) => setSubscriptionForm(prev => ({ ...prev, tipo: value }))}
                    >
                      <SelectTrigger className="text-gray-900">
                        <SelectValue placeholder="Selecciona el tipo" />
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div>
                    <Label htmlFor="fecha_fin" className="text-gray-700">Fecha de Fin</Label>
                    <Input
                      id="fecha_fin"
                      name="fecha_fin"
                      type="date"
                      value={subscriptionForm.fecha_fin}
                      onChange={handleFormChange}
                      className="text-gray-900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fecha_proximo_pago" className="text-gray-700">Fecha del Próximo Pago</Label>
                    <Input
                      id="fecha_proximo_pago"
                      name="fecha_proximo_pago"
                      type="date"
                      value={subscriptionForm.fecha_proximo_pago}
                      onChange={handleFormChange}
                      className="text-gray-900"
                    />
                  </div>
                </div>

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