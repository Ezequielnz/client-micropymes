
import { 
  Blocks, 
  Smartphone, 
  Zap, 
  Globe, 
  HeartHandshake, 
  ArrowRight 
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Blocks,
      title: "Modular y flexible",
      description: "Elegí solo los módulos que necesitás. Empezá simple y crecé a tu ritmo sin pagar funciones que no usás.",
      color: "blue"
    },
    {
      icon: Smartphone,
      title: "Interfaz moderna",
      description: "Diseño limpio y intuitivo que tu equipo va a adorar. Funciona perfecto en cualquier dispositivo.",
      color: "purple"
    },
    {
      icon: Zap,
      title: "Automatizaciones inteligentes",
      description: "Dejá que OperixML haga el trabajo pesado. Automatizá tareas repetitivas y enfocate en lo importante.",
      color: "orange"
    },
    {
      icon: Globe,
      title: "Acceso desde cualquier lugar",
      description: "Tu negocio no para, tu sistema tampoco. Accedé desde casa, la oficina o de viaje.",
      color: "green"
    },
    {
      icon: HeartHandshake,
      title: "Soporte cercano",
      description: "Equipo argentino que entiende las PyMEs locales. Configuración personalizada incluida.",
      color: "red"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600 border-blue-100",
      purple: "bg-purple-50 text-purple-600 border-purple-100",
      orange: "bg-orange-50 text-orange-600 border-orange-100",
      green: "bg-green-50 text-green-600 border-green-100",
      red: "bg-red-50 text-red-600 border-red-100"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <section id="funcionalidades" className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6">
            Funcionalidades que realmente necesitás
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sin complicaciones técnicas, sin funciones innecesarias. Solo las herramientas esenciales 
            para que tu PyME funcione como un reloj.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl ${getColorClasses(feature.color)} flex items-center justify-center mb-6 border`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl">
            <span>Ver todas las funcionalidades</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Features;