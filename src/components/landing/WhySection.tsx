
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const WhySection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6">
            ¿Por qué OperixML?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Porque ya perdiste suficiente tiempo con sistemas que te complican la vida en lugar de simplificarla
          </p>
        </div>

        {/* Problem vs Solution */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 lg:mb-20">
          {/* Problem Side */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-8">
              <AlertCircle className="text-red-500" size={24} />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">El problema que conocés</h3>
            </div>
            
            <div className="space-y-4">
              {[
                "ERPs obsoletos que necesitan 20 clics para hacer algo simple",
                "Interfaces poco atractivas y confusas que nadie quiere usar",
                "Sistemas lentos que te hacen perder tiempo valioso",
                "Funciones que no necesitás pero igual tenés que pagar",
                "Soporte técnico que no entiende tu negocio"
              ].map((problem, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{problem}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solution Side */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-8">
              <CheckCircle className="text-green-500 !stroke-green-500" size={24} />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">La solución que merecés</h3>
            </div>
            
            <div className="space-y-4">
              {[
                "Interfaz moderna e intuitiva que da gusto usar todos los días",
                "Todo lo que necesitás en 1 o 2 clics máximo",
                "Rendimiento ultra-rápido en cualquier dispositivo",
                "Pagás solo por los módulos que realmente usás",
                "Soporte humano que entiende las PyMEs argentinas"
              ].map((solution, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-100">
                  <CheckCircle size={16} className="text-green-500 !stroke-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">{solution}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-6">
            ¿Cansado de ERPs lentos, feos o imposibles de usar?
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl">
  <span>OperixML está hecho para vos</span>
  <ArrowRight size={20} />
</button>
        </div>
      </div>
    </section>
  );
};

export default WhySection;