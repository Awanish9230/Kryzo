import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Loader from './Loader';

const PrivateRoute = ({ role, children }) => {

    const { user, loading } = useContext(AuthContext);



    if (loading) {

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
