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
            Sin sorpresas, sin costos ocultos. Un único plan con todo lo que necesitás.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="flex justify-center mb-16">
          <div className="w-full max-w-lg bg-white p-4 sm:p-6 lg:p-8 rounded-2xl border-2 border-blue-200 hover:border-blue-300 transition-all relative shadow-lg">
            <div className="absolute -top-4 left-0 right-0 flex justify-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                <Star size={14} />
                <span>Todo incluido</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Plan Completo</h3>
              <p className="text-gray-600 mb-4">La solución integral para tu negocio</p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$15.000</span>
                <span className="text-gray-600">/mes</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Todos los módulos incluidos",
                "Soporte Directo por WhatsApp",
                "Reportes inteligentes para toma de decisiones",
                "Historial de ventas ilimitado",
                "Puesta en marcha asistida"
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
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 lg:p-12 rounded-2xl border border-blue-100 text-center">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Probalo gratis. Sin compromiso.
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