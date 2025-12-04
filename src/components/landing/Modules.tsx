
import {
  ShoppingCart,
  Package,
  DollarSign,
  FolderOpen,
  Users,
  BarChart3,
  Calendar,
  FileText
} from 'lucide-react';

const Modules = () => {
  const modules = [
    {
      icon: ShoppingCart,
      title: "Ventas",
      description: "Presupuestos, facturación y seguimiento de oportunidades en un solo lugar.",
      popular: true,
      proximo: false
    },
    {
      icon: Package,
      title: "Inventario",
      description: "Control de stock en tiempo real, alertas automáticas y gestión de proveedores.",
      popular: true,
      proximo: false
    },
    {
      icon: DollarSign,
      title: "Finanzas",
      description: "Flujo de caja, cuentas por cobrar/pagar y reportes automáticos para tu contador.",
      popular: false,
      proximo: false
    },
    {
      icon: FolderOpen,
      title: "Proyectos",
      description: "Seguimiento de tareas, tiempos y costos por proyecto con vista clara del progreso.",
      popular: false,
      proximo: true
    },
    {
      icon: Users,
      title: "CRM",
      description: "Base de datos de clientes, historial de interacciones y automatización de seguimiento.",
      popular: true,
      proximo: true
    },
    {
      icon: BarChart3,
      title: "Reportes",
      description: "Dashboards en tiempo real y reportes automáticos para tomar mejores decisiones.",
      popular: false,
      proximo: false
    },
    {
      icon: Calendar,
      title: "Agenda",
      description: "Calendario compartido, citas y recordatorios automáticos integrados al sistema.",
      popular: false,
      proximo: false
    },
    {
      icon: FileText,
      title: "Documentos",
      description: "Almacenamiento seguro y acceso rápido a contratos, facturas y documentos importantes.",
      popular: false,
      proximo: false
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Módulos disponibles
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empezá con lo básico y agregá módulos cuando los necesites.
            Cada uno está pensado para funcionar perfecto solo o integrado con los demás.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <div
                key={index}
                className="relative bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group"
              >
                {module.popular && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Popular
                  </div>
                )}
                {module.proximo && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Próximo
                  </div>
                )}

                <div className="w-12 h-12 bg-gray-50 group-hover:bg-blue-50 rounded-lg flex items-center justify-center mb-4 transition-colors">
                  <Icon size={24} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {module.title}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {module.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Integration Message */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Todos los módulos trabajan juntos
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            No son sistemas separados que no se hablan entre sí. Cada módulo comparte información
            automáticamente para darte una vista completa de tu negocio.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="bg-white px-3 py-1 rounded-full text-gray-700 border">Una sola base de datos</span>
            <span className="bg-white px-3 py-1 rounded-full text-gray-700 border">Reportes unificados</span>
            <span className="bg-white px-3 py-1 rounded-full text-gray-700 border">Sin duplicar información</span>
            <span className="bg-white px-3 py-1 rounded-full text-gray-700 border">Vista 360° del negocio</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Modules;