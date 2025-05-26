import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Revisar si hay un token almacenado en localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Obtener información del usuario
    const fetchUserInfo = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Si hay un error con el token, redirigir al login
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserInfo();
  }, [navigate]);
  
  if (loading) {
    return <div>Cargando...</div>;
  }
  
  return (
    <div className="card">
      <h1>Hello World!</h1>
      {user && (
        <div>
          <p>Bienvenido, {user.nombre} {user.apellido}</p>
          <p>Email: {user.email}</p>
          <p>Rol: {user.rol}</p>
        </div>
      )}
      <button
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