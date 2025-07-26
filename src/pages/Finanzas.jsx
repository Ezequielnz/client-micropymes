import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { PageLoader } from '../components/LoadingSpinner';
import { useBusinessContext } from '../contexts/BusinessContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Eye,
  FileText,
  CreditCard
} from 'lucide-react';

// Lazy load finance components
const FinanzasDashboard = lazy(() => import('../components/finance/FinanzasDashboard'));
const FinanzasMovimientos = lazy(() => import('../components/finance/FinanzasMovimientos'));
const FinanzasCategorias = lazy(() => import('../components/finance/FinanzasCategorias'));
const CuentasPendientes = lazy(() => import('../components/finance/CuentasPendientes'));
const FlujoCajaChart = lazy(() => import('../components/finance/FlujoCajaChart'));

const FinanzasContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const { currentBusiness } = useBusinessContext();
  const navigate = useNavigate();

  // Redirect if no business selected
  useEffect(() => {
    if (!currentBusiness) {
      navigate('/my-businesses');
    }
  }, [currentBusiness, navigate]);

  if (!currentBusiness) {
    return <PageLoader />;
  }

  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: DollarSign,
      component: FinanzasDashboard
    },
    {
      id: 'movimientos',
      name: 'Movimientos',
      icon: FileText,
      component: FinanzasMovimientos
    },
    {
      id: 'categorias',
      name: 'Categorías',
      icon: Eye,
      component: FinanzasCategorias
    },
    {
      id: 'cuentas',
      name: 'Cuentas Pendientes',
      icon: CreditCard,
      component: CuentasPendientes
    },
    {
      id: 'flujo-caja',
      name: 'Flujo de Caja',
      icon: TrendingUp,
      component: FlujoCajaChart
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || FinanzasDashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finanzas</h1>
              <p className="mt-2 text-gray-600">
                Gestiona los ingresos, egresos y flujo de caja de {currentBusiness.nombre}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm
                      bg-white !bg-opacity-100 !bg-transparent
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 !text-blue-600'
                        : 'border-transparent text-gray-500 !text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon 
                      className={`
                        -ml-0.5 mr-2 h-5 w-5
                        ${activeTab === tab.id
                          ? 'text-blue-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                        }
                      `}
                    />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          <Suspense fallback={<PageLoader />}>
            <ActiveComponent businessId={currentBusiness.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

const Finanzas = () => {
  return (
    <Layout>
      <FinanzasContent />
    </Layout>
  );
};

export default Finanzas;
