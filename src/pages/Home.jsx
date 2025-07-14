import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, businessAPI } from '../utils/api';
import Dashboard from '../components/Dashboard';
import { PageLoader } from '../components/LoadingSpinner';

function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('Home component mounted');
    
    const token = localStorage.getItem('token');
    console.log('Token found:', !!token);
    
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Verificar estado de aprobación automáticamente
    const checkApprovalStatus = async () => {
      try {
        const businessesData = await businessAPI.getBusinesses();
        if (!businessesData || businessesData.length === 0) {
          console.log('No approved businesses found, redirecting to pending approval');
          navigate('/pending-approval');
          return;
        }
        console.log('User has approved businesses, can access home');
        setLoading(false);
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('User pending approval, redirecting');
          navigate('/pending-approval');
        } else if (error.response?.status === 401) {
          console.log('Unauthorized, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.clear();
          navigate('/login');
        } else {
          console.error('Error checking approval status:', error);
          setError('Error al verificar el estado de aprobación');
          setLoading(false);
        }
      }
    };
    
    checkApprovalStatus();
  }, [navigate]);
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-lg font-medium mb-4">
            Error: {error}
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recargar página
            </button>
            <button 
              onClick={() => navigate('/login')} 
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Ir al login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (loading) {
    return <PageLoader message="Verificando acceso..." variant="primary" />;
  }

  // Si todo está bien, mostrar el Dashboard
  return <Dashboard />;
}

export default Home; 