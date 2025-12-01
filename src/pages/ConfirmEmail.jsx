import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';

/**
 * ConfirmEmail component. Handles the email confirmation process.
 * It attempts to extract an access token from the URL hash parameters.
 * If a token is found, it verifies it against the backend.
 * Upon success, it displays a success message and prompts the user to log in manually.
 */
function ConfirmEmail() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  /** @type {[string, function]} message - State for displaying messages to the user. */
  const [message, setMessage] = useState('Verificando...');
  /** @type {[string, function]} status - State for tracking the confirmation status ('loading', 'success', 'error'). */
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();
  // We don't need login from useAuth anymore for auto-login, but keeping the hook if needed for other context is fine.
  // Actually, let's remove the unused destructuring if we don't use it to avoid linter warnings, 
  // but if useAuth is needed for some reason (like checking if already logged in), we can keep it.
  // For now, I'll remove 'login' from destructuring since we don't use it.
  const { } = useAuth();

  /**
   * useEffect hook to handle the email confirmation logic when the component mounts.
   */
  useEffect(() => {
    // Extraer el token de acceso de la URL o hash
    const hashParams = new URLSearchParams(
      window.location.hash.substring(1) // quita el # del principio
    );
    const accessToken = hashParams.get('access_token');

    if (accessToken) {
      // Si tenemos un token, lo guardamos y obtenemos los datos del usuario
      const handleTokenConfirmation = async () => {
        try {
          // 1. Guardar el token temporalmente para verificación
          localStorage.setItem('token', accessToken);

          // 2. Verificar el token obteniendo datos del usuario
          // NOTA: No hacemos login automático, solo verificamos que el token sea válido
          await authAPI.getCurrentUser();

          // 3. Si llegamos aquí, el token es válido
          setMessage('Tu cuenta ha sido confirmada exitosamente. Ya puedes iniciar sesión.');
          setStatus('success');

          // Limpiamos el token del storage para no dejar sesiones abiertas accidentalmente
          localStorage.removeItem('token');

        } catch (error) {
          console.error('Error verificando token:', error);
          localStorage.removeItem('token');
          setMessage('El enlace de confirmación es inválido o ha expirado.');
          setStatus('error');
        }
      };

      handleTokenConfirmation();
    } else {
      // Si no hay token, puede que haya habido un error
      setMessage('No se encontró token de acceso. Por favor verifica el enlace en tu correo.');
      setStatus('error');
    }
  }, []);

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
                <Link to="/login">
                  <Button variant="outline" size="sm" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                    Iniciar Sesión
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
                <Link to="/login">
                  <Button variant="outline" size="sm" className="w-full text-gray-700">
                    Iniciar Sesión
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
                Confirmación de Email
              </h1>
              <p className="text-lg text-gray-600">
                Verificando tu cuenta de BizFlow Pro
              </p>
            </div>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                  {status === 'loading' && 'Verificando...'}
                  {status === 'success' && 'Email Confirmado'}
                  {status === 'error' && 'Error de Confirmación'}
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  {status === 'loading' && 'Por favor espera mientras verificamos tu email'}
                  {status === 'success' && 'Tu cuenta ha sido activada exitosamente'}
                  {status === 'error' && 'Hubo un problema al confirmar tu email'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  {status === 'loading' && (
                    <div className="flex items-center gap-3 text-blue-600">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="text-lg font-medium">Verificando...</span>
                    </div>
                  )}
                  {status === 'success' && (
                    <div className="flex items-center gap-3 text-green-600">
                      <CheckCircle className="h-8 w-8" />
                      <span className="text-lg font-medium">¡Confirmado!</span>
                    </div>
                  )}
                  {status === 'error' && (
                    <div className="flex items-center gap-3 text-red-600">
                      <AlertCircle className="h-8 w-8" />
                      <span className="text-lg font-medium">Error</span>
                    </div>
                  )}
                </div>

                <Alert variant={status === 'error' ? 'destructive' : 'default'}>
                  {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {status === 'success' && <CheckCircle className="h-4 w-4" />}
                  {status === 'error' && <AlertCircle className="h-4 w-4" />}
                  <AlertDescription className="text-center">
                    {message}
                  </AlertDescription>
                </Alert>

                {status === 'success' && (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600">
                      Ahora puedes acceder a tu cuenta.
                    </p>
                    <Link to="/login">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Iniciar Sesión
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}

                {status === 'error' && (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600">
                      Serás redirigido a la página de inicio de sesión...
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Link to="/login">
                        <Button variant="outline" className="text-gray-700">
                          Iniciar Sesión
                        </Button>
                      </Link>
                      <Link to="/register">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Crear Nueva Cuenta
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
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

export default ConfirmEmail;