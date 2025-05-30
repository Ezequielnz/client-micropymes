import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { businessAPI } from '../utils/api';
import { 
  ArrowRight, 
  Building2, 
  AlertCircle,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

function CreateBusiness() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [businessName, setBusinessName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await businessAPI.createBusiness({ nombre: businessName });
            navigate('/'); // Redirecting to home for now, adjust as needed
        } catch (err) {
            console.error('Error creating business:', err);
            const errorMessage = err.response?.data?.detail || err.message || 'Error creating business';
            setError(errorMessage);
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
                                        Dashboard
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="outline" size="sm" className="text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                                        Iniciar Sesión
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
                                        Dashboard
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="outline" size="sm" className="w-full text-gray-700">
                                        Iniciar Sesión
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
                            <div className="flex justify-center mb-4">
                                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Configura tu negocio
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Crear Nuevo Negocio
                            </h1>
                            <p className="text-lg text-gray-600">
                                Configura tu empresa en BizFlow Pro
                            </p>
                        </div>

                        <Card className="border border-gray-200 shadow-sm">
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                                    Información del Negocio
                                </CardTitle>
                                <CardDescription className="text-center text-gray-600">
                                    Ingresa los datos básicos de tu empresa
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {error}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">
                                            Nombre del Negocio
                                        </Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                type="text"
                                                id="businessName"
                                                name="businessName"
                                                value={businessName}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                                required
                                                className="pl-10"
                                                placeholder="Mi Empresa S.A."
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Este será el nombre que aparecerá en tus facturas y documentos
                                        </p>
                                    </div>

                                    <Button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                        size="lg"
                                    >
                                        {loading ? (
                                            'Creando negocio...'
                                        ) : (
                                            <>
                                                Crear Negocio
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="text-center">
                                    <p className="text-sm text-gray-600">
                                        ¿Necesitas ayuda?{' '}
                                        <a 
                                            href="#" 
                                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                        >
                                            Contacta soporte
                                        </a>
                                    </p>
                                </div>

                                <div className="text-center pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                        Podrás modificar esta información más tarde desde la configuración
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

export default CreateBusiness; 