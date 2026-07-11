import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

export default function ProtectRoute({ children, allowedPermission }) {
    const { user, loading } = useAuth();

    if (loading) return <Loading fullScreen />;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const permisos = user?.permisos || [];
    const permisosRequeridos = Array.isArray(allowedPermission) ? allowedPermission : [allowedPermission];

    const tienePermiso = permisosRequeridos.some(p => permisos.includes(p));

    if (!tienePermiso) {
        return <Navigate to="/login" replace />;
    }

    return children;
}