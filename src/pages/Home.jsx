import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, businessAPI } from '../utils/api';
import '../styles/Home.css';

function Home() {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Revisar si hay un token almacenado en localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Obtener información del usuario y sus negocios
    const fetchData = async () => {
      try {
        const [userData, businessesData] = await Promise.all([
          authAPI.getCurrentUser(),
          businessAPI.getBusinesses()
        ]);
        setUser(userData);
        setBusinesses(businessesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Si hay un error con el token, redirigir al login
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  return (
    <div className="container">
      <div className="card">
        <h1>Bienvenido a MicroPymes</h1>
        {user && (
          <div className="user-info">
            <p>Bienvenido, {user.nombre} {user.apellido}</p>
            <p>Email: {user.email}</p>
            <p>Rol: {user.rol}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Mis Negocios</h2>
        {businesses.length > 0 ? (
          <div className="businesses-list">
            {businesses.map((business) => (
              <div key={business.id} className="business-card">
                <h3>{business.nombre}</h3>
                <p>{business.descripcion}</p>
                <div className="business-actions">
                  <button 
                    className="action-btn"
                    onClick={() => navigate(`/business/${business.id}/products`)}
                  >
                    Productos
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => navigate(`/business/${business.id}/categories`)}
                  >
                    Categorías
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => navigate(`/business/${business.id}`)}
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No tienes negocios registrados.</p>
        )}
        <button 
          className="create-business-btn"
          onClick={() => navigate('/create-business')}
        >
          Crear Nuevo Negocio
        </button>
      </div>

      <button
        className="logout-btn"
        onClick={() => {
          localStorage.removeItem('token');
          navigate('/login');
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}

export default Home; 