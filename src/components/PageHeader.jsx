import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Home } from 'lucide-react';
import { authAPI } from '../utils/api';

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
  backPath = '/home',
  showBackButton = true,
  showHomeButton = true,
  showLogoutButton = true,
  userName = 'Usuario',
  children 
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
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
                onClick={() => navigate(backPath)}
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
            
            <span className="text-sm text-gray-600">
              Hola, {userName}
            </span>
            
            {showLogoutButton && (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            )}
            
            {children}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PageHeader; 