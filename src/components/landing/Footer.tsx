
const Footer = () => {
  return (
    <footer id="contacto" className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/operix_logo.png" alt="OperixML Logo" className="w-8 h-8 object-contain" />
              <h3 className="text-white font-semibold text-xl">OperixML</h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              El ERP modular diseñado específicamente para PyMEs argentinas.
              Simple, potente y hecho para que te enfoques en hacer crecer tu negocio.
            </p>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-400">Email:</span>{' '}
                <a href="mailto:contacto@operixml.com" className="text-blue-400 hover:text-blue-300">
                  contacto@operixml.com
                </a>
              </div>
              {/* WhatsApp oculto temporalmente */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces rápidos</h3>
            <ul className="space-y-3">
              <li>
                <a href="#inicio" className="hover:text-blue-400 transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#funcionalidades" className="hover:text-blue-400 transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#precios" className="hover:text-blue-400 transition-colors">
                  Precios
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-blue-400 transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="/politicas" className="hover:text-blue-400 transition-colors">
                  Políticas de privacidad
                </a>
              </li>
              <li>
                <a href="/terminos" className="hover:text-blue-400 transition-colors">
                  Términos de servicio
                </a>
              </li>
              <li>
                <a href="/cookies" className="hover:text-blue-400 transition-colors">
                  Política de cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 OperixML. Todos los derechos reservados.
          </p>
          <p className="text-gray-400 text-sm mt-4 md:mt-0">
            Hecho con ❤️ para PyMEs argentinas
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;