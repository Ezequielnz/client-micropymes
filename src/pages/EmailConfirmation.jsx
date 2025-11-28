import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authAPI } from '../utils/api';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
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

  const checkConfirmationStatus = useCallback(async () => {
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
  }, [email]);

  // Check confirmation status on component mount if email is provided
  useEffect(() => {
    if (email) {
      checkConfirmationStatus();
    }
  }, [email, checkConfirmationStatus]);

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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Confirma tu email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Te hemos enviado un enlace de confirmación a tu correo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border border-gray-200 shadow-lg bg-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center text-gray-900">
              Verificación de cuenta
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Revisa tu bandeja de entrada y haz clic en el enlace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success Alert */}
            {isConfirmed && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
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
              <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                Tu email
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {!isConfirmed && (
                <>
                  <Button
                    onClick={checkConfirmationStatus}
                    disabled={loading || !email}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
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
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                >
                  Ir a iniciar sesión
                </Button>
              )}
            </div>

            {/* Help Text */}
            <div className="text-center space-y-4 pt-2">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  ¿No encuentras el email?
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Revisa tu carpeta de <strong>Spam</strong> o <strong>Correo No Deseado</strong>.
                </p>
              </div>

              <a
                href="https://mail.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir Gmail
              </a>

              <div className="pt-4 border-t border-gray-200">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Volver a iniciar sesión
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            ¿Problemas con la confirmación?{' '}
            <a href="mailto:soporte@operixml.com" className="text-blue-600 hover:text-blue-500 font-medium">
              Contacta soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmailConfirmation;
