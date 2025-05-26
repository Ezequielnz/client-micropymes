import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'usuario'
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
      console.log('Enviando datos de registro:', formData);
      
      const data = await authAPI.register(formData);
      console.log('Respuesta del servidor:', data);
      
      // Verificar si tenemos un token de acceso
      if (data.access_token) {
        // Guardar el token en localStorage
        localStorage.setItem('token', data.access_token);

        // Redireccionar a la página de inicio
        navigate('/');
      } else {
        // Si no hay token, mostrar mensaje de éxito y redirigir a login
        setError(
          <div className="success-message">
            <p><strong>¡Registro exitoso!</strong></p>
            <p>{data.detail || 'Cuenta creada correctamente.'}</p>
            <p className="help-text">
              Por favor revisa tu correo electrónico para confirmar tu cuenta.
              Si no encuentras el email, revisa tu carpeta de spam.
              Serás redirigido a la página de inicio de sesión en unos segundos.
            </p>
          </div>
        );
        setTimeout(() => {
          navigate('/login');
        }, 5000); // Redirigir después de 5 segundos para dar tiempo a leer el mensaje
      }
    } catch (err) {
      console.error('Error completo:', err);
      setError(err.response?.data?.detail || err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Registro</h1>
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
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="apellido">Apellido</label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
      <p>
        ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}

export default Register; 