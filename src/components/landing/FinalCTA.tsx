
import { ChevronRight, Shield, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FinalCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22 fill-rule=%22nonzero%22%3E%3Cpath d=%22m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 text-center relative">
        {/* Main Content */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          Probá OperixML gratis y{' '}
          <span className="text-blue-200">transformá tu negocio</span>
        </h2>
        
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Empezá hoy mismo y en menos de una semana vas a estar preguntándote 
          cómo pudiste manejar tu negocio sin OperixML.
        </p>

        {/* CTA Button */}
        <button 
          className="bg-white hover:bg-gray-50 text-blue-600 px-10 py-5 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 flex items-center space-x-3 mx-auto shadow-xl hover:shadow-2xl mb-8"
          onClick={() => navigate('/register')}
        >
          <span>Probar gratis por 14 días</span>
          <ChevronRight size={24} />
        </button>

        {/* Trust Indicators */}
        <div className="flex flex-row items-center justify-center space-x-4 sm:space-x-8 text-blue-100 mb-12 flex-wrap">
          <div className="flex items-center space-x-2">
            <Shield size={16} />
            <span>Fácil</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={16} />
            <span>Sin riesgos</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users size={16} />
            <span>Totalmente online</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">10+</div>
            <div className="text-blue-200">horas ahorradas por semana</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">5 min</div>
            <div className="text-blue-200">para configurar tu cuenta</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">$0</div>
            <div className="text-blue-200">los primeros 14 días</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;