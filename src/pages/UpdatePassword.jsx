import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import {
    Lock,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

export default function UpdatePassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Las contraseñas no coinciden.' });
            return;
        }

        if (password.length < 6) {
            setStatus({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }

        setLoading(true);

        try {
            await authAPI.changePassword({ newPassword: password });
            setStatus({
                type: 'success',
                message: 'Contraseña actualizada correctamente. Redirigiendo...'
            });
            setTimeout(() => {
                navigate('/home');
            }, 2000);
        } catch (err) {
            console.error('Error update password:', err);
            setStatus({
                type: 'error',
                message: err.response?.data?.detail || 'Error al actualizar la contraseña.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card>
                    <CardContent className="pt-6">
                        <p>Sesión no válida o expirada. Por favor, solicita un nuevo enlace de recuperación.</p>
                        <Button onClick={() => navigate('/login')} className="mt-4 w-full">Ir al Login</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md space-y-4">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Nueva contraseña</CardTitle>
                    <CardDescription className="text-center">
                        Ingresa tu nueva contraseña para asegurar tu cuenta.
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
                            <Label htmlFor="password">Nueva contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Repite la contraseña"
                                    className="pl-10"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
