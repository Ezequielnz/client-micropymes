import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authAPI } from '../utils/api';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ArrowLeft,
  Clock
} from 'lucide-react';

/**
 * EmailConfirmation component. Handles email confirmation flow and provides
 * options to resend confirmation emails.
 */
function EmailConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Effect for countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // Check confirmation status on component mount if email is provided
  useEffect(() => {
    if (email) {
      checkConfirmationStatus();
    }
  }, [email]);

  const checkConfirmationStatus = async () => {
    if (!email) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await authAPI.checkEmailConfirmation(email);
      
      if (data.is_confirmed) {
        setIsConfirmed(true);
        setMessage('Tu email ya está confirmado. Puedes iniciar sesión.');
      } else {
        setMessage('Tu email aún no está confirmado. Por favor revisa tu correo electrónico.');
      }
    } catch (err) {
      console.error('Error checking confirmation status:', err);
      setError('Error al verificar el estado de confirmación');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    setResendLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await authAPI.resendConfirmation(email);
      if (data.already_confirmed) {
        setIsConfirmed(true);
        setMessage('Tu email ya está confirmado. Puedes iniciar sesión.');
      } else {
        setMessage('Email de confirmación reenviado correctamente. Revisa tu bandeja de entrada.');
        setCountdown(60); // 60 seconds cooldown
      }
    } catch (err) {
      console.error('Error resending confirmation:', err);
      const detail = err?.response?.data?.detail || 'Error al reenviar confirmación';
      setError(detail);
    } finally {
      setResendLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
    setMessage('');
    setIsConfirmed(false);
  };

  return (
    <div className="page-container flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Confirma tu email
          </h2>
          <p className="mt-2 text-gray-600">
            Te hemos enviado un email de confirmación
          </p>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold text-center text-gray-900">
              Verificación de email
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Revisa tu correo electrónico y haz clic en el enlace de confirmación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success Alert */}
            {isConfirmed && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="text-green-800">
                    <p className="font-semibold">¡Email confirmado!</p>
                    <p className="mt-1">{message}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Info Alert */}
            {message && !isConfirmed && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="text-blue-800">
                    {message}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Tu email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isConfirmed && (
                <>
                  <Button
                    onClick={checkConfirmationStatus}
                    disabled={loading || !email}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      'Verificar estado'
                    )}
                  </Button>

                  <Button
                    onClick={handleResendConfirmation}
                    disabled={resendLoading || !email || countdown > 0}
                    variant="outline"
                    className="w-full"
                  >
                    {resendLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Reenviando...
                      </>
                    ) : countdown > 0 ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Reenviar en {countdown}s
                      </>
                    ) : (
                      'Reenviar email de confirmación'
                    )}
                  </Button>
                </>
              )}

              {isConfirmed && (
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Ir a iniciar sesión
                </Button>
              )}
            </div>

            {/* Help Text */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                ¿No encuentras el email? Revisa tu carpeta de spam o correo no deseado.
              </p>
              
              <div className="pt-4 border-t border-gray-200">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Volver a iniciar sesión
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            ¿Problemas con la confirmación?{' '}
            <a href="mailto:soporte@bizflowpro.com" className="text-blue-600 hover:text-blue-500">
              Contacta soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmailConfirmation; 