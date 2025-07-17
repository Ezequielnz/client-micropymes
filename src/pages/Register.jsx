import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authAPI, businessAPI, publicBusinessAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowRight, 
  Mail, 
  Lock, 
  User, 
  AlertCircle,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

/**
 * Register component. Handles new user registration by collecting user details,
 * submitting them to the registration API, and providing feedback to the user.
 * It also handles the redirection logic post-registration, which might involve
 * immediate login or prompting for email confirmation.
 */
function Register() {
  const { login } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  /**
   * @type {[object, function]} formData - State for storing user registration input.
   * @property {string} email - The user's email address.
   * @property {string} password - The user's chosen password.
   * @property {string} nombre - The user's first name.
   * @property {string} apellido - The user's last name.
   * @property {string} rol - The user's role, defaults to 'usuario'.
   */
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'usuario'
  });
  
  /** @type {[string, function]} error - State for storing error messages as string only */
  const [error, setError] = useState('');
  /** @type {[boolean, function]} loading - State to indicate if a registration request is in progress. */
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Removed business search functionality - users will be invited by business owners

  /**
   * Handles changes in form input fields.
   * Updates the `formData` state with the new value for the changed field.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles the registration form submission.
   * Prevents default form submission, sets loading state, and calls `authAPI.register`.
   * If registration is successful and an access token is returned, it stores the token
   * and navigates to the home page.
   * If no token is returned (common for flows requiring email confirmation), it redirects
   * to the email confirmation page.
   * On failure, it extracts an error message and updates the `error` state.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Construir payload - ahora solo se permite crear nuevos negocios
    const payload = {
      ...formData,
    };

    try {
      console.log('Enviando datos de registro:', payload);
      const data = await authAPI.register(payload);
      console.log('Respuesta del servidor:', data);
      if (data.access_token) {
        try {
          // 1. Guardar el token temporalmente para obtener los datos del usuario
          localStorage.setItem('token', data.access_token);
          
          // 2. Obtener los datos del usuario usando el token
          const userData = await authAPI.getCurrentUser();
          
          // 3. Llamar a la función login del AuthContext para actualizar el estado
          login(userData, data.access_token);
          
          navigate('/');
        } catch (userErr) {
          console.error('Error obteniendo datos del usuario:', userErr);
          // Si falla obtener los datos del usuario, limpiar el token y mostrar error
          localStorage.removeItem('token');
          setError('Error al obtener datos del usuario después del registro');
        }
      } else {
        navigate(`/email-confirmation?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (err) {
      console.error('Error completo:', err);
      
      // Limpiar el token si hay error
      localStorage.removeItem('token');
      
      let errorMessage = 'Error al registrar usuario';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.detail.message) {
          errorMessage = err.response.data.detail.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-erp-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-erp-primary rounded-lg mr-3"></div>
                <h1 className="text-2xl font-bold text-erp-neutral-900">
                  BizFlow Pro
                </h1>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/">
                  <Button variant="outline" size="sm" className="text-erp-neutral-700 hover:text-erp-primary hover:bg-erp-neutral-50 border-erp-neutral-200">
                    Inicio
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="text-erp-neutral-700 hover:text-erp-primary hover:bg-erp-neutral-50 border-erp-neutral-200">
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-erp-neutral-600 hover:text-erp-neutral-900 focus:outline-none focus:text-erp-neutral-900"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-erp-neutral-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Link to="/">
                  <Button variant="outline" size="sm" className="w-full text-erp-neutral-700 border-erp-neutral-200">
                    Inicio
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="w-full text-erp-neutral-700 border-erp-neutral-200">
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <section className="bg-erp-neutral-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center px-3 py-1 bg-erp-primary-100 text-erp-primary-700 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gratis por 30 días
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-erp-neutral-900 mb-4">
                Crear Cuenta
              </h1>
              <p className="text-lg text-erp-neutral-600">
                Únete a BizFlow Pro y transforma tu negocio
              </p>
            </div>

            <Card className="border border-erp-neutral-200 shadow-erp-soft hover:shadow-erp-medium transition-all duration-300">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-center text-erp-neutral-900">
                  Comienza tu prueba gratuita
                </CardTitle>
                <CardDescription className="text-center text-erp-neutral-600">
                  Completa el formulario para crear tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-sm font-medium text-erp-neutral-700">
                        Nombre
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-erp-neutral-400" />
                        <Input
                          type="text"
                          id="nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                          className="pl-10 border-erp-neutral-200 focus:border-erp-primary focus:ring-erp-primary"
                          placeholder="Juan"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apellido" className="text-sm font-medium text-erp-neutral-700">
                        Apellido
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-erp-neutral-400" />
                        <Input
                          type="text"
                          id="apellido"
                          name="apellido"
                          value={formData.apellido}
                          onChange={handleChange}
                          required
                          className="pl-10 border-erp-neutral-200 focus:border-erp-primary focus:ring-erp-primary"
                          placeholder="Pérez"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-erp-neutral-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-erp-neutral-400" />
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="pl-10 border-erp-neutral-200 focus:border-erp-primary focus:ring-erp-primary"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-erp-neutral-700">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-erp-neutral-400" />
                      <Input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="pl-10 border-erp-neutral-200 focus:border-erp-primary focus:ring-erp-primary"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {/* Información sobre negocios */}
                  <div className="space-y-2">
                    <div className="bg-erp-primary-50 border border-erp-primary-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-erp-primary-800 mb-2">
                        ¿Qué pasa después del registro?
                      </h4>
                      <p className="text-sm text-erp-primary-700 mb-2">
                        Una vez registrado, podrás:
                      </p>
                      <ul className="text-sm text-erp-primary-700 list-disc list-inside space-y-1">
                        <li>Crear tu propio negocio y ser el administrador</li>
                        <li>Esperar a que un administrador te invite a su negocio</li>
                        <li>Gestionar productos, ventas y clientes según tus permisos</li>
                      </ul>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-erp-primary hover:bg-erp-primary-hover text-white shadow-erp-primary hover-lift"
                    size="lg"
                  >
                    {loading ? (
                      'Creando cuenta...'
                    ) : (
                      <>
                        Crear Cuenta Gratis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-erp-neutral-600">
                    ¿Ya tienes una cuenta?{' '}
                    <Link 
                      to="/login" 
                      className="font-medium text-erp-primary hover:text-erp-primary-hover transition-colors"
                    >
                      Inicia sesión aquí
                    </Link>
                  </p>
                </div>

                <div className="text-center pt-4 border-t border-erp-neutral-200">
                  <p className="text-xs text-erp-neutral-500">
                    Al crear una cuenta, aceptas nuestros{' '}
                    <a href="#" className="text-erp-primary hover:text-erp-primary-hover">
                      Términos de Servicio
                    </a>{' '}
                    y{' '}
                    <a href="#" className="text-erp-primary hover:text-erp-primary-hover">
                      Política de Privacidad
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-erp-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-erp-primary rounded-lg mr-3"></div>
              <h3 className="text-2xl font-bold">BizFlow Pro</h3>
            </div>
            <p className="text-erp-neutral-400 max-w-md mx-auto">
              La plataforma de gestión empresarial más avanzada para micro y pequeñas empresas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Register; 