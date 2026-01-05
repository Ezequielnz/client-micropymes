import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authAPI } from '../utils/api';
import {
    ArrowRight,
    Mail,
    AlertCircle,
    CheckCircle,
    ArrowLeft
} from 'lucide-react';

export default function RequestPasswordReset() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });
        setLoading(true);

        try {
            await authAPI.requestPasswordReset(email);
            setStatus({
                type: 'success',
                message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.'
            });
        } catch (err) {
            console.error('Error request reset:', err);
            // For security, usually we don't want to reveal if email exists, 
            // but if specific error handling is needed:
            setStatus({
                type: 'error',
                message: 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md space-y-4">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Restablecer contraseña</CardTitle>
                    <CardDescription className="text-center">
                        Ingresa tu correo electrónico y te enviaremos un enlace para recuperar tu cuenta.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status.message && (
                        <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
                            {status.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertDescription className={status.type === 'success' ? 'text-green-600' : ''}>
                                {status.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar enlace'}
                            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <Link to="/login" className="flex items-center justify-center text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
