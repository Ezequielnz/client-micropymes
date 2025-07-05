import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  Menu,
  X,
  Star,
  Sparkles
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const features = [
    {
      icon: <BarChart3 className="h-12 w-12 text-erp-primary" />,
      title: "Análisis Inteligente",
      description: "Dashboards en tiempo real con insights accionables para tomar decisiones basadas en datos."
    },
    {
      icon: <Users className="h-12 w-12 text-erp-success" />,
      title: "CRM Avanzado",
      description: "Gestiona clientes, automatiza seguimientos y aumenta la retención con herramientas inteligentes."
    },
    {
      icon: <ShoppingCart className="h-12 w-12 text-erp-info" />,
      title: "POS Inteligente",
      description: "Sistema de punto de venta con inventario automático y procesamiento de pagos integrado."
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-erp-warning" />,
      title: "Crecimiento Automatizado",
      description: "Herramientas de marketing y ventas que escalan automáticamente con tu negocio."
    },
    {
      icon: <Shield className="h-12 w-12 text-erp-error" />,
      title: "Seguridad Empresarial",
      description: "Encriptación de nivel bancario y cumplimiento de estándares internacionales."
    },
    {
      icon: <Zap className="h-12 w-12 text-erp-primary" />,
      title: "Automatización IA",
      description: "Inteligencia artificial que automatiza tareas repetitivas y optimiza procesos."
    }
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Fundadora, Café Luna",
      content: "BizFlow Pro transformó completamente mi negocio. Ahora puedo enfocarme en crecer mientras la plataforma maneja todo lo demás.",
      rating: 5
    },
    {
      name: "Carlos Mendoza",
      role: "CEO, TechStart",
      content: "La mejor inversión que hemos hecho. ROI del 300% en los primeros 6 meses.",
      rating: 5
    },
    {
      name: "Ana Rodríguez",
      role: "Directora, Boutique Style",
      content: "Increíble cómo algo tan potente puede ser tan fácil de usar. Mi equipo lo adoptó en días.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-erp-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-erp-primary rounded-lg mr-3"></div>
                <h1 className="text-2xl font-bold text-erp-neutral-900">
                  BizFlow Pro
                </h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-erp-neutral-600 hover:text-erp-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-erp-neutral-600 hover:text-erp-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Pricing
                </a>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="text-erp-neutral-700 hover:text-erp-primary hover:bg-erp-neutral-50 border-erp-neutral-200">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-erp-primary hover:bg-erp-primary-hover text-white shadow-erp-primary">
                    Get Started
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
              <a href="#features" className="text-erp-neutral-600 hover:text-erp-primary block px-3 py-2 rounded-md text-base font-medium">
                Features
              </a>
              <a href="#pricing" className="text-erp-neutral-600 hover:text-erp-primary block px-3 py-2 rounded-md text-base font-medium">
                Pricing
              </a>
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="w-full text-erp-neutral-700 border-erp-neutral-200">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="w-full bg-erp-primary text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-erp-neutral-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-erp-primary-100 text-erp-primary-700 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                MVP Ready - Launch Your Business Today
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-erp-neutral-900 mb-6">
              Complete Business Management
              <br />
              <span className="text-erp-primary">System for SMEs</span>
            </h1>
            
            <p className="text-xl text-erp-neutral-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Streamline your sales, inventory, billing, and team management with our all-in-one
              <br />
              professional platform. Built for small businesses that want to scale efficiently.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/register">
                <Button size="lg" className="text-lg px-8 py-3 bg-erp-primary hover:bg-erp-primary-hover text-white shadow-erp-primary hover-lift">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 text-erp-neutral-700 border-erp-neutral-300 hover:bg-erp-neutral-50">
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-erp-primary mb-2">5 Steps</div>
                <div className="text-erp-neutral-600">Quick Setup</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-erp-primary mb-2">100%</div>
                <div className="text-erp-neutral-600">AFIP Compliant</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-erp-success mb-2">24/7</div>
                <div className="text-erp-neutral-600">Smart Notifications</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-erp-neutral-900 mb-4">
              Todo lo que necesitas para hacer crecer tu negocio
            </h2>
            <p className="text-xl text-erp-neutral-600 max-w-3xl mx-auto">
              Herramientas profesionales diseñadas específicamente para micro y pequeñas empresas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border border-erp-neutral-200 shadow-erp-soft hover:shadow-erp-medium transition-all duration-300 hover-lift">
                <CardHeader className="pb-4">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-erp-neutral-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-erp-neutral-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-erp-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-erp-neutral-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xl text-erp-neutral-600 max-w-3xl mx-auto">
              Historias reales de emprendedores que han transformado sus negocios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border border-erp-neutral-200 shadow-erp-soft hover:shadow-erp-medium transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-erp-warning fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-erp-neutral-700 text-base italic leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-erp-primary-100 rounded-full mr-4 flex items-center justify-center">
                      <span className="text-erp-primary-600 font-semibold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-erp-neutral-900">{testimonial.name}</p>
                      <p className="text-sm text-erp-neutral-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-erp-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="text-xl text-erp-primary-200 mb-8 max-w-2xl mx-auto">
            Únete a miles de emprendedores que ya están creciendo con BizFlow Pro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-3 bg-white text-erp-primary hover:bg-erp-neutral-50 shadow-erp-strong hover-lift">
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-erp-primary transition-all duration-200">
              Hablar con Ventas
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-erp-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-erp-primary rounded-lg mr-3"></div>
                <h3 className="text-2xl font-bold">BizFlow Pro</h3>
              </div>
              <p className="text-erp-neutral-400 mb-6 max-w-md">
                La plataforma de gestión empresarial más avanzada, diseñada específicamente 
                para micro y pequeñas empresas en América Latina.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-erp-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integraciones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-erp-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Comunidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Estado del Sistema</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-erp-neutral-800 pt-8 text-center text-erp-neutral-400">
            <p>&copy; 2024 BizFlow Pro. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 