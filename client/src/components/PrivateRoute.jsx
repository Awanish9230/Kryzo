import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Loader from './Loader';

const PrivateRoute = ({ role, children }) => {
    console.log('PrivateRoute: Mounting/Rendering', { role });
    const { user, loading } = useContext(AuthContext);

    console.log('PrivateRoute: Status', { loading, userRole: user?.role, requiredRole: role });

    if (loading) {
        console.log('PrivateRoute: Rendering Loader');
        return <Loader fullScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        // Redirect to their respective dashboard if role mismatch
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
    }

    return children ? children : <Outlet />;
};

export default PrivateRoute;
