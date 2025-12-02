import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    // Esto solo corre en navegador
    const usuario = localStorage.getItem('usuarioLogueado');
    setIsAuth(!!usuario);
  }, []);

  // Mientras verifica (evita pantallazo o error en Vercel)
  if (isAuth === null) {
    return <div>Cargando...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
