
import { Check, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const navigate = useNavigate();
  return (
    <section id="precios" className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6">
            Precios transparentes y justos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sin sorpresas, sin costos ocultos. Pagás solo por lo que usás, cuando lo uses.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">

          {/* Starter Plan */}
          <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Esencial</h3>
              <p className="text-gray-600 mb-4">Para empezar y probar</p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$XX.XXX</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <p className="text-sm text-gray-500">Hasta 5 usuarios</p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Módulos básicos (Ventas + Inventario)",
                "Soporte por email",
                "Reportes estándar",
                "Almacenamiento 10GB",
                "Configuración guiada"
              ].map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Check size={16} className="text-green-500 !stroke-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className="w-full bg-white border border-blue-600 hover:border-blue-700 text-blue-600 hover:text-blue-700 py-3 rounded-xl font-semibold transition-all hover:bg-blue-50"
              onClick={() => navigate('/register')}
            >
              Empezar gratis
            </button>
          </div>

          {/* Professional Plan */}
          <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl border-2 border-blue-200 hover:border-blue-300 transition-all relative">
            <div className="absolute -top-4 left-0 right-0 flex justify-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                <Star size={14} />
                <span>Más popular</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Profesional</h3>
              <p className="text-gray-600 mb-4">Para PyMEs en crecimiento</p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$XX.XXX</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <p className="text-sm text-gray-500">Hasta 20 usuarios</p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Todos los módulos incluidos",
                "Soporte prioritario",
                "Reportes avanzados + dashboards",
                "Almacenamiento 100GB",
                "Automatizaciones personalizadas",
                "Integración con sistemas externos",
                "Capacitación del equipo incluida"
              ].map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Check size={16} className="text-green-500 !stroke-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => navigate('/register')}
            >
              Empezar gratis
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Empresarial</h3>
              <p className="text-gray-600 mb-4">Para equipos grandes</p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">A medida</span>
              </div>
              <p className="text-sm text-gray-500">Usuarios ilimitados</p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Instalación on-premise disponible",
                "Soporte dedicado 24/7",
                "Reportes y dashboards personalizados",
                "Almacenamiento ilimitado",
                "Desarrollos específicos",
                "Integración completa con ERP legado",
                "Consultoría estratégica incluida"
              ].map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Check size={16} className="text-green-500 !stroke-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <a href="mailto:contacto@operixml.com" className="w-full inline-block text-center bg-white border border-blue-600 hover:border-blue-700 text-blue-600 hover:text-blue-700 py-3 rounded-xl font-semibold transition-all hover:bg-blue-50">
              Contactar ventas
            </a>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 lg:p-12 rounded-2xl border border-blue-100 text-center">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Probalo gratis. Elegí el plan cuando estés listo.
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Los 14 días de prueba incluyen acceso completo a todas las funciones.
            No necesitás tarjeta de crédito y podés cancelar en cualquier momento.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl" onClick={() => navigate('/register')}>
            <span>Empezar prueba gratis</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;