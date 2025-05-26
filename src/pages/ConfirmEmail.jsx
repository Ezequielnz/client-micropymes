import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ConfirmEmail() {
  const [message, setMessage] = useState('Verificando...');
  const navigate = useNavigate();

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