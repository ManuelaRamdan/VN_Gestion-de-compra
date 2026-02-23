import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

export default function ProtectRoute({ children, allowedRole }) {
    const { user, loading } = useAuth();

    if (loading) return <Loading fullScreen />;

    // 1. Si no hay usuario logueado, mandar al login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Obtener el rol del usuario de forma segura (igual que en el Navbar)
    const getUserRole = (u) => {
        if (!u) return "";
        if (u.rol && typeof u.rol === 'string') return u.rol;
        if (u.rol && typeof u.rol === 'object' && u.rol.nombre) return u.rol.nombre;
        // Compatibilidad legacy
        if (u.sector && typeof u.sector === 'object' && u.sector.nombre) return u.sector.nombre; 
        return "";
    };

    const currentRole = getUserRole(user).toUpperCase();

    // 3. Normalizar 'allowedRole': Si me pasan un texto, lo convierto en array de 1 elemento
    const rolesPermitidos = Array.isArray(allowedRole) ? allowedRole : [allowedRole];

    // 4. Verificar si el rol del usuario está en la lista permitida
    const tienePermiso = rolesPermitidos.some(role => role.toUpperCase() === currentRole);

    if (!tienePermiso) {
        // Si no tiene permiso, lo mandamos al login (o podrías hacer una página de "Sin Permiso")
        return <Navigate to="/login" replace />;
    }

    return children;
}