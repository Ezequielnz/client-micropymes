import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login(formData.email, formData.password);
      
      // Guardar el token en localStorage
      localStorage.setItem('token', data.access_token);

      // Redireccionar a la página de inicio
      navigate('/');
    } catch (err) {
      console.error('Error completo:', err);
      
      // Extraer el mensaje de error
      const errorMessage = err.response?.data?.detail || err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      
      // Mostrar instrucciones adicionales para errores específicos
      if (errorMessage.includes('Email no confirmado') || errorMessage.includes('correo electrónico')) {
        setError(
          <div>
            <p>{errorMessage}</p>
            <p className="help-text">
              Revisa tu bandeja de entrada y haz clic en el enlace de confirmación. 
              Si no lo encuentras, revisa tu carpeta de spam.
            </p>
            {process.env.NODE_ENV !== 'production' && (
              <p className="dev-tools">
                <button 
                  type="button" 
                  className="dev-button"
                  onClick={() => activateAccount(formData.email)}
                >
                  Activar cuenta (solo desarrollo)
                </button>
              </p>
            )}
          </div>
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para activar la cuenta (solo en desarrollo)
  const activateAccount = async (email) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/v1/auth/activate/${email}`);
      const data = await response.json();
      
      if (response.ok) {
        setError(
          <div className="success-message">
            <p>{data.detail}</p>
            <p className="help-text">Ahora puedes intentar iniciar sesión nuevamente.</p>
          </div>
        );
      } else {
        setError(
          <div>
            <p>No se pudo activar la cuenta: {data.detail}</p>
            <p className="help-text">{data.instrucciones || ''}</p>
          </div>
        );
      }
    } catch (error) {
      setError(`Error al activar la cuenta: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Iniciar Sesión</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
      <p>
        ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
}

export default Login; 