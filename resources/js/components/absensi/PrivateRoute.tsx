import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';

const PrivateRoute = ({ children }) => {
  const [auth, setAuth] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        setAuth(true);
      } catch (error) {
        setAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return auth ? children : <Navigate to="/login" />;
};

export default PrivateRoute;