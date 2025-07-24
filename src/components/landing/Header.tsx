import { Link } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">OperixML</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className="text-gray-600 hover:text-gray-900 transition-colors">
              Inicio
            </a>
            <a href="#funcionalidades" className="text-gray-600 hover:text-gray-900 transition-colors">
              Funcionalidades
            </a>
            <a href="#precios" className="text-gray-600 hover:text-gray-900 transition-colors">
              Precios
            </a>
            <a href="#contacto" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contacto
            </a>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/login">
              <button className="bg-white text-blue-700 hover:text-blue-900 hover:bg-white border border-blue-600 px-6 py-2 rounded-lg font-medium transition-all">
                Iniciar sesión
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center space-x-1 shadow-lg hover:shadow-xl">
                <span>Empezá gratis por 14 días</span>
                <ChevronRight size={16} />
              </button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-white">
            <nav className="flex flex-col space-y-4">
              <a href="#inicio" className="text-gray-600 hover:text-gray-900 transition-colors">
                Inicio
              </a>
              <a href="#funcionalidades" className="text-gray-600 hover:text-gray-900 transition-colors">
                Funcionalidades
          </a>
              <a href="#precios" className="text-gray-600 hover:text-gray-900 transition-colors">
                Precios
              </a>
              <a href="#contacto" className="text-gray-600 hover:text-gray-900 transition-colors">
                Contacto
              </a>
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <Link to="/login">
                  <button className="w-full text-left bg-white text-blue-700 hover:text-blue-900 hover:bg-white border border-blue-600 px-6 py-2 rounded-lg font-medium transition-all">
                    Iniciar sesión
                  </button>
                </Link>
                <Link to="/register">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-1">
                    <span>Probar gratis</span>
                    <ChevronRight size={16} />
                  </button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;