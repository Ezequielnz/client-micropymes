
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Play, BarChart3, Users, Zap } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section id="inicio" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24 scroll-mt-24">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239CA3AF%22 fill-opacity=%220.03%22 fill-rule=%22nonzero%22%3E%3Cpath d=%22m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 xl:gap-24 items-center">
          {/* Left side - Content */}
          <div className="text-left lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap size={16} />
              <span>El ERP que tu equipo realmente quiere usar</span>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 text-left leading-tight">
              Tu PyME merece un sistema que{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                trabaje por vos
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 max-w-3xl mb-8 text-left">
              Los ERPs ya no tienen que ser lentos ni complicados. 
              OperixML integra módulos inteligentes y un uso intuitivo para que trabajes mejor y tu negocio avance más rápido.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-center lg:justify-start mb-8 w-full">
  <button
    className="flex bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
    onClick={() => navigate('/register')}
  >
    <span>Empezá gratis por 14 días</span>
    <ChevronRight size={20} />
  </button>
  <button
    className="flex border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all items-center justify-center space-x-2 hover:bg-gray-50 !bg-white"
  >
    <Play size={20} />
    <span>Ver demo (2 min)</span>
  </button>
</div>

            {/* Trust indicators */}
            <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <span className="flex items-center">✓ No se requiere tarjeta de crédito</span>
              <span className="flex items-center">✓ Cancelá en cualquier momento</span>
              <span className="flex items-center">✓ Configuración en 5 minutos</span>
            </div>
          </div>

          {/* Right side - Dashboard Preview */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Dashboard Header */}
              <div className="bg-gray-900 px-6 py-4 flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="bg-gray-800 px-3 py-1 rounded text-gray-300 text-sm">
                  dashboard.operixml.com
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                {/* Top Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 size={16} className="text-blue-600" />
                      <span className="text-sm font-medium text-gray-600">Ventas</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$847.2K</p>
                    <p className="text-sm text-green-600">+12.5%</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users size={16} className="text-orange-600" />
                      <span className="text-sm font-medium text-gray-600">Clientes</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">1,249</p>
                    <p className="text-sm text-green-600">+8.2%</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap size={16} className="text-purple-600" />
                      <span className="text-sm font-medium text-gray-600">Órdenes</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">89</p>
                    <p className="text-sm text-green-600">+15.1%</p>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Crecimiento mensual</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    </div>
                  </div>
                  {/* Simplified chart representation */}
                  <div className="h-32 bg-gradient-to-r from-blue-100 to-orange-100 rounded-lg flex items-end justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800 mb-2">📈</div>
                      <p className="text-sm text-gray-600">Vista interactiva en tiempo real</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
              🚀 En vivo
            </div>
          </div>
        </div>
      </div>
    </section>
  )
};

export default Hero;