import { Navigate } from 'react-router-dom';

// Este componente envuelve a las páginas que quieres proteger
const ProtectedRoute = ({ children }) => {
  // Buscamos si existe la "marca" en el almacenamiento del navegador
  const isAuth = localStorage.getItem('usuarioLogueado');

  // Si NO existe (es decir, no se ha logueado), lo mandamos al inicio
  if (!isAuth) {
    // Opcional: Puedes quitar este console.log después
    console.warn("Intento de acceso no autorizado. Redirigiendo...");
    return <Navigate to="/" replace />;
  }

  // Si SÍ existe, dejamos que pase y vea el contenido (children)
  return children;
};

export default ProtectedRoute;