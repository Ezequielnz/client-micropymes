import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ConfirmEmail component. Handles the email confirmation process.
 * It attempts to extract an access token from the URL hash parameters.
 * If a token is found, it's stored in localStorage, and the user is redirected
 * to the home page, effectively logging them in. If no token is found,
 * it displays an error message and redirects to the login page.
 * This component does not make a direct API call to a confirmation endpoint;
 * the token itself is the confirmation artifact provided by the backend (e.g., Supabase).
 */
function ConfirmEmail() {
  /** @type {[string, function]} message - State for displaying messages to the user (e.g., "Verificando...", "Email confirmado..."). */
  const [message, setMessage] = useState('Verificando...');
  const navigate = useNavigate();

  /**
   * useEffect hook to handle the email confirmation logic when the component mounts.
   * It parses the URL hash to find an 'access_token'.
   * If found, it saves the token to localStorage and navigates to the home page.
   * Otherwise, it indicates that no token was found and navigates to the login page.
   */
  useEffect(() => {
    // Extraer el token de acceso de la URL o hash
    const hashParams = new URLSearchParams(
      window.location.hash.substring(1) // quita el # del principio
    );
    const accessToken = hashParams.get('access_token');
    
    if (accessToken) {
      // Si tenemos un token, lo guardamos y redirigimos
      localStorage.setItem('token', accessToken);
      setMessage('Email confirmado exitosamente. Redirigiendo...');
      
      // Redireccionar a la página principal después de un breve retraso
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      // Si no hay token, puede que haya habido un error
      setMessage('No se encontró token de acceso. Intenta iniciar sesión manualmente.');
      
      // Redireccionar a login después de un breve retraso
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  }, [navigate]);

  return (
    <div className="form-container">
      <h1>Confirmación de Email</h1>
      <div className="success-message">
        <p>{message}</p>
      </div>
    </div>
  );
}

export default ConfirmEmail; 