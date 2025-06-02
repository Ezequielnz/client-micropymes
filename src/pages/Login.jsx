import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authAPI } from '../utils/api';
import { 
  ArrowRight, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

/**
 * Login component. Handles user authentication by collecting email and password,
 * submitting them to the login API, and navigating the user upon success or
 * displaying an error message upon failure.
 */
function Login() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  /**
   * @type {[object, function]} formData - State for storing user input (email and password).
   * @property {string} email - The user's email address.
   * @property {string} password - The user's password.
   */
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  /** @type {[string | JSX.Element, function]} error - State for storing and displaying error messages. Can be a string or JSX for richer error display. */
  const [error, setError] = useState('');
  /** @type {[boolean, function]} loading - State to indicate if a login request is in progress. Used to disable form elements. */
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
   * Handles the login form submission.
   * Prevents default form submission, sets loading state, and calls `authAPI.login`.
   * On success, it stores the received access token in localStorage and navigates
   * the user to the home page ('/').
   * On failure, it extracts an error message from the API response or uses a generic
   * error message, and updates the `error` state. It also provides specific UI
   * for "Email not confirmed" errors, including a development-only button to activate the account.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login(formData.email, formData.password);
      
      // Guardar el token en localStorage
      localStorage.setItem('token', data.access_token);

      // Redireccionar a la página de inicio
      navigate('/home');
    } catch (err) {
      console.error('Error completo:', err);
      
      // Manejar diferentes tipos de errores
      if (err.response?.status === 403 && err.response?.data?.detail?.error_type === 'email_not_confirmed') {
        // Error específico de email no confirmado
        const email = err.response.data.detail.email || formData.email;
        setError(
          <div className="space-y-3">
            <p className="font-medium text-red-600">Email no confirmado</p>
            <p className="text-sm text-gray-600">
              Tu cuenta necesita ser verificada antes de poder iniciar sesión.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                type="button" 
                variant="outline"
                size="sm"
                onClick={() => navigate(`/email-confirmation?email=${encodeURIComponent(email)}`)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Ir a página de confirmación
              </Button>
              {process.env.NODE_ENV !== 'production' && (
                <Button 
                  type="button" 
                  variant="outline"
                  size="sm"
                  onClick={() => activateAccount(formData.email)}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  Activar cuenta (solo desarrollo)
                </Button>
              )}
            </div>
          </div>
        );
      } else {
        // Otros errores
        let errorMessage = 'Error al iniciar sesión';
        
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
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Activates a user account directly by making a GET request to a development-only endpoint.
   * This function is intended for use during development to bypass email confirmation.
   * Sets loading state during the activation attempt and displays success or error messages
   * in the `error` state area.
   * @param {string} email - The email of the account to activate.
   */
  const activateAccount = async (email) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/v1/auth/activate/${email}`);
      const data = await response.json();
      
      if (response.ok) {
        setError(
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <p className="font-medium">{data.detail}</p>
            </div>
            <p className="text-sm text-gray-600">Ahora puedes intentar iniciar sesión nuevamente.</p>
          </div>
        );
      } else {
        setError(
          <div className="space-y-2">
            <p>No se pudo activar la cuenta: {data.detail}</p>
            <p className="text-sm text-gray-600">{data.instrucciones || ''}</p>
          </div>
        );
      }
    } catch (error) {
      setError(`Error al activar la cuenta: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3"></div>
                <h1 className="text-2xl font-bold text-gray-900">
                  BizFlow Pro
                </h1>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/">
                  <Button variant="outline" size="sm" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    Inicio
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Registrarse
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Link to="/">
                  <Button variant="outline" size="sm" className="w-full text-gray-700">
                    Inicio
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="w-full bg-blue-600 text-white">
                    Registrarse
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Iniciar Sesión
              </h1>
              <p className="text-lg text-gray-600">
                Accede a tu cuenta de BizFlow Pro
              </p>
            </div>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                  Bienvenido de vuelta
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Ingresa tus credenciales para continuar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant={typeof error === 'string' && error.includes('activar') ? 'default' : 'destructive'}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="pl-10"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="pl-10"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    {loading ? (
                      'Iniciando sesión...'
                    ) : (
                      <>
                        Iniciar Sesión
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    ¿No tienes una cuenta?{' '}
                    <Link 
                      to="/register" 
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Regístrate aquí
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3"></div>
              <h3 className="text-2xl font-bold">BizFlow Pro</h3>
            </div>
            <p className="text-gray-400 max-w-md mx-auto">
              La plataforma de gestión empresarial más avanzada para micro y pequeñas empresas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Login; 