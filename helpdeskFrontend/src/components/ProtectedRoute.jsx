import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute
 * Vérifie la présence d'un token JWT dans le localStorage.
 * - Token absent → redirige vers /login (replace empêche le retour arrière vers la route protégée).
 * - Token présent → rend les routes enfants via <Outlet />.
 */
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
