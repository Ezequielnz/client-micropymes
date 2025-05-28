import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';

/**
 * Register component. Handles new user registration by collecting user details,
 * submitting them to the registration API, and providing feedback to the user.
 * It also handles the redirection logic post-registration, which might involve
 * immediate login or prompting for email confirmation.
 */
function Register() {
  /**
   * @type {[object, function]} formData - State for storing user registration input.
   * @property {string} email - The user's email address.
   * @property {string} password - The user's chosen password.
   * @property {string} nombre - The user's first name.
   * @property {string} apellido - The user's last name.
   * @property {string} rol - The user's role, defaults to 'usuario'.
   */
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'usuario'
  });
  /** @type {[string | JSX.Element, function]} error - State for storing and displaying error messages. Can be a string or JSX. */
  const [error, setError] = useState('');
  /** @type {[boolean, function]} loading - State to indicate if a registration request is in progress. */
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles changes in form input fields.
   * Updates the `formData` state with the new value for the changed field.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles the registration form submission.
   * Prevents default form submission, sets loading state, and calls `authAPI.register`.
   * If registration is successful and an access token is returned, it stores the token
   * and navigates to the home page.
   * If no token is returned (common for flows requiring email confirmation), it displays
   * a success message prompting the user to check their email and then redirects to the
   * login page after a delay.
   * On failure, it extracts an error message and updates the `error` state.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
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