import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Home, User, Settings, ChevronDown } from 'lucide-react';
import { authAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button className={classes} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

const PageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  backPath = null, // Ahora es opcional
  showBackButton = true,
  showHomeButton = true,
  showLogoutButton = true,
  userName = 'Usuario',
  children 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Calcular información del usuario basada en AuthContext
  const userInfo = {
    nombre: user?.nombre || user?.email?.split('@')[0] || userName,
    email: user?.email || 'usuario@ejemplo.com'
  };

  // Ya no necesitamos useEffect para cargar datos del usuario

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    setShowUserDropdown(false);
    navigate('/profile');
  };

  // Función para manejar el botón volver de forma inteligente
  const handleBack = () => {
    if (backPath) {
      // Si se especifica una ruta específica, usarla
      navigate(backPath);
    } else {
      // Si no, volver a la página anterior
      navigate(-1);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            )}
            
            <div className="flex items-center">
              {Icon && (
                <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {showHomeButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/home')}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Button>
            )}
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{ 
                  backgroundColor: '#ffffff !important',
                  border: '1px solid #e5e5e5 !important',
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#374151 !important',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb !important';
                  e.target.style.color = '#374151 !important';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ffffff !important';
                  e.target.style.color = '#374151 !important';
                }}
                className=""
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showUserDropdown && (
                <div 
                  className="absolute right-0 top-12 w-64 border border-gray-200 rounded-lg shadow-lg z-50"
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: '#374151'
                  }}
                >
                  <div 
                    className="p-4 border-b border-gray-100"
                    style={{ 
                      backgroundColor: '#ffffff',
                      color: '#374151'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <p 
                          className="font-medium"
                          style={{ color: '#111827' }}
                        >
                          {userInfo.nombre}
                        </p>
                        <p 
                          className="text-sm"
                          style={{ color: '#6b7280' }}
                        >
                          {userInfo.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ backgroundColor: '#ffffff', padding: '0.5rem' }}>
                    <button
                      onClick={handleEditProfile}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: '#374151',
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxShadow: 'none',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.color = '#374151';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#ffffff';
                        e.target.style.color = '#374151';
                      }}
                      className=""
                    >
                      <Settings style={{ width: '1rem', height: '1rem', color: '#374151' }} />
                      Editar perfil
                    </button>

                    {showLogoutButton && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          handleLogout();
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          color: '#374151',
                          backgroundColor: '#ffffff',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          outline: 'none',
                          boxShadow: 'none',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f3f4f6';
                          e.target.style.color = '#374151';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#ffffff';
                          e.target.style.color = '#374151';
                        }}
                        className=""
                      >
                        <LogOut style={{ width: '1rem', height: '1rem', color: '#374151' }} />
                        Cerrar sesion
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {children}
          </div>
        </div>
      </div>
      
      {/* Overlay to close dropdown when clicking outside */}
      {showUserDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserDropdown(false)}
        />
      )}
    </nav>
  );
};

export default PageHeader; 





