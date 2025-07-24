
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Shield, 
  TrendingUp, 
  Target, 
  Heart,
  CheckCircle
} from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Ahorro de tiempo real",
      description: "Recuperá hasta 10 horas por semana que perdés en tareas manuales y procesos lentos.",
      metric: "10+ horas/semana"
    },
    {
      icon: Shield,
      title: "Tranquilidad total",
      description: "Dormí tranquilo sabiendo que tu información está segura y siempre disponible.",
      metric: "99.9% uptime"
    },
    {
      icon: TrendingUp,
      title: "Escalabilidad sin complicaciones",
      description: "Crecé sin límites. OperixML se adapta a tu negocio, no al revés.",
      metric: "Ilimitado"
    },
    {
      icon: Target,
      title: "Menos errores, más aciertos",
      description: "Automatizaciones inteligentes eliminan errores humanos y mejoran la precisión.",
      metric: "-85% errores"
    },
    {
      icon: Heart,
      title: "Diseño que da gusto usar",
      description: "Tu equipo va a querer usar el sistema. Interfaz moderna, rápida y sin frustraciones.",
      metric: "100% adoptión"
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6">
            Los beneficios que vas a notar desde el primer día
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            No son promesas vacías. Son resultados reales que ven nuestros clientes después de cambiar a OperixML.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={28} className="text-blue-600 !stroke-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {benefit.title}
                      </h3>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {benefit.metric}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="bg-white p-8 lg:p-12 rounded-2xl shadow-sm border border-gray-100">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 text-center lg:text-left">
                El cambio que tu negocio necesita
              </h3>
              <div className="space-y-4">
                {[
                  "Procesos más eficientes desde la primera semana",
                  "Equipo más productivo y menos estresado",
                  "Información siempre actualizada para mejores decisiones",
                  "Más tiempo para enfocarte en hacer crecer el negocio"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle size={20} className="text-green-500 !stroke-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center lg:text-right">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 lg:p-8 rounded-2xl text-center lg:text-right">
                <div className="text-4xl font-bold text-blue-600 mb-2">14 días</div>
                <p className="text-gray-700 font-medium mb-4">
                  es todo lo que necesitás para ver la diferencia
                </p>
                <Link to="/register">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl inline-block">
                    Empezar ahora
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;