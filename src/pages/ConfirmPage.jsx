import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import {
    CheckCircle,
    AlertCircle,
    Loader2,
    ArrowRight
} from 'lucide-react';

function ConfirmPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Verificando tu correo...');

    useEffect(() => {
        const verifyToken = async () => {
            const tokenHash = searchParams.get('token_hash');
            const type = searchParams.get('type') || 'email';

            if (!tokenHash) {
                setStatus('error');
                setMessage('Enlace inválido: No se encontró el token de verificación.');
                return;
            }

            try {
                // Llamar al backend para verificar el hash
                const response = await authAPI.verifyEmail(tokenHash, type);

                // Si es exitoso, loguear al usuario
                if (response.access_token) {
                    login(response.user, response.access_token);
                    setStatus('success');
                    setMessage('¡Correo verificado exitosamente! Redirigiendo...');

                    // Redirigir al home después de 2 segundos
                    setTimeout(() => {
                        navigate('/home');
                    }, 2000);
                }
            } catch (error) {
                console.error('Verification error:', error);
                setStatus('error');
                setMessage(error.response?.data?.detail || 'Hubo un error al verificar tu correo. El enlace puede haber expirado.');
            }
        };

        verifyToken();
    }, [searchParams, navigate, login]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Verificación de Cuenta
                    </CardTitle>
                    <CardDescription>
                        Procesando tu solicitud de confirmación
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center py-4">
                        {status === 'loading' && (
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                        )}
                        {status === 'success' && (
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        )}
                        {status === 'error' && (
                            <AlertCircle className="h-12 w-12 text-red-600" />
                        )}
                    </div>

                    <Alert variant={status === 'error' ? 'destructive' : 'default'} className="text-center">
                        <AlertDescription className="text-base">
                            {message}
                        </AlertDescription>
                    </Alert>

                    {status === 'error' && (
                        <div className="flex justify-center pt-2">
                            <Link to="/login">
                                <Button variant="outline">
                                    Volver al Login
                                </Button>
                            </Link>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex justify-center pt-2">
                            <Button onClick={() => navigate('/home')} className="bg-blue-600 hover:bg-blue-700">
                                Ir al Inicio <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Helper Link component since we are not importing Link from react-router-dom in the main body
import { Link } from 'react-router-dom';

export default ConfirmPage;
