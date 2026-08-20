import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api"; // ajustá la ruta según donde tengas tu instancia de axios

export const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const u = sessionStorage.getItem("usuario");
        const expired = sessionStorage.getItem("SESSION_EXPIRED");

        if (expired) {
            setSessionExpired(true);
        }
        if (u) {
            setUser(JSON.parse(u));
        }

        setLoading(false);
    }, []);

    // Ya no recibe "token" como parámetro: el backend lo setea solo,
    // como cookie httpOnly, en la respuesta del login.
    const login = (usuario) => {
        sessionStorage.setItem("usuario", JSON.stringify(usuario));
        sessionStorage.removeItem("SESSION_EXPIRED");
        sessionStorage.removeItem("MANUAL_LOGOUT");

        setUser(usuario);
        setSessionExpired(false);
    };

    const logout = async (expired = false) => {
        setUser(null);
        setSessionExpired(expired);

        sessionStorage.removeItem("usuario");
        sessionStorage.removeItem("SESSION_EXPIRED");

        if (!expired) {
            sessionStorage.setItem("MANUAL_LOGOUT", "true");
            try {
                // Le avisamos al backend que borre la cookie.
                // Si falla (ej: ya estaba vencida), no importa, igual limpiamos localmente.
                await api.post("/api/usuarios/logout");
            } catch (e) {
                console.error("Error al cerrar sesión en el servidor:", e);
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                sessionExpired,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}