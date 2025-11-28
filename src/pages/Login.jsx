import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
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
  const { login } = useAuth();
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

  // Handle email confirmation token
  React.useEffect(() => {
    const handleConfirmation = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (accessToken && type === 'signup') {
        setLoading(true);
        try {
          // 1. Store token temporarily
          localStorage.setItem('token', accessToken);

          // 2. Verify token and get user data
          const userData = await authAPI.getCurrentUser();

          // 3. Login user
          login(userData, accessToken);

          // 4. Show success message
          setError(
            <div className="space-y-2">
              <p className="font-medium text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                ¡Cuenta confirmada exitosamente!
              </p>
              <p className="text-sm text-gray-600">
                Redirigiendo al inicio...
              </p>
            </div>
          );

          // 5. Redirect after delay
          setTimeout(() => {
            navigate('/home');
          }, 2000);

        } catch (err) {
          console.error('Error confirming email:', err);
          localStorage.removeItem('token');
          setError('El enlace de confirmación es inválido o ha expirado.');
        } finally {
          setLoading(false);
        }
      }
    };

    handleConfirmation();
  }, [navigate, login]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles form submission for user login.
   * Calls the login API with the form data, handles the response including
   * error message, and updates the `error` state. It also provides specific UI
   * for "Email not confirmed" errors, including a development-only button to activate the account.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Obtener el token del endpoint de login
      const loginData = await authAPI.login(formData.email, formData.password);

      // 2. Guardar el token temporalmente para obtener los datos del usuario
      localStorage.setItem('token', loginData.access_token);

      // 3. Obtener los datos del usuario usando el token
      const userData = await authAPI.getCurrentUser();

      // 4. Llamar a la función login del AuthContext para actualizar el estado
      login(userData, loginData.access_token);

      // 5. Redireccionar a la página de inicio
      navigate('/home');
    } catch (err) {
      console.error('Error completo:', err);

      // Limpiar el token si hay error
      localStorage.removeItem('token');

      // Manejar diferentes tipos de errores
      if (err.response?.status === 403 && err.response?.data?.detail?.error_type === 'email_not_confirmed') {
        // Error específico de email no confirmado
        const email = err.response.data.detail.email || formData.email;
        setError(
          <div className="space-y-3">
            <p className="font-medium text-erp-error">Email no confirmado</p>
            <p className="text-sm text-erp-neutral-600">
              Tu cuenta necesita ser verificada antes de poder iniciar sesión.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate(`/email-confirmation?email=${encodeURIComponent(email)}`)}
                className="text-erp-primary border-erp-primary-300 hover:bg-erp-primary-50"
              >
                Ir a página de confirmación
              </Button>
              {import.meta.env.DEV && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await authAPI.activateAccount(email);
                      alert('Cuenta activada exitosamente. Ahora puedes iniciar sesión.');
                      setError('');
                    } catch (activateErr) {
                      alert('Error al activar la cuenta: ' + activateErr.message);
                    }
                  }}
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                >
                  [DEV] Activar cuenta automáticamente
                </Button>
              )}
            </div>
          </div>
        );
      } else if (err.response?.status === 401) {
        setError('Credenciales inválidas. Por favor verifica tu email y contraseña.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">OperixML</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/">
                  <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400">
                    Inicio
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                    Registrarse
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 mobile-menu-btn-white"
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
                  <Button variant="outline" size="sm" className="w-full text-gray-600 border-gray-300">
                    Inicio
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Registrarse
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239CA3AF%22 fill-opacity=%220.03%22 fill-rule=%22nonzero%22%3E%3Cpath d=%22m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Iniciar Sesión
              </h1>
              <p className="text-lg text-gray-600">
                Accede a tu cuenta de OperixML
              </p>
            </div>

            <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur-sm">
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
                        className="pl-10 border-gray-200 focus:border-blue-600 focus:ring-blue-600"
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
                        className="pl-10 border-gray-200 focus:border-blue-600 focus:ring-blue-600"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
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
                      className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
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
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <h3 className="text-2xl font-bold">OperixML</h3>
            </div>
            <p className="text-gray-400 max-w-md mx-auto">
              El ERP modular e intuitivo diseñado para que tu PyME pueda enfocarse en crecer.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Login; 