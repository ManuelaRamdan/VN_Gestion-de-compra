import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = localStorage.getItem("token");
        const u = localStorage.getItem("usuario");
        const expired = localStorage.getItem("SESSION_EXPIRED");

        if (expired) {
            setSessionExpired(true); 
        }
        if (t && u) {
            setToken(t);
            setUser(JSON.parse(u));
        }

        setLoading(false);
    }, []);

    const login = (token, usuario) => {
        localStorage.setItem("token", token);
        //localStorage solo guarda strings. Al guardar un objeto usas JSON.stringify:
        localStorage.setItem("usuario", JSON.stringify(usuario));
        // usuario = { nombre: "Juan", email: "juan@mail.com", rol: "administracion" }
        // Se guarda como: '{"nombre":"Juan","email":"juan@mail.com","rol":"administracion"}'
        localStorage.removeItem("SESSION_EXPIRED");
        localStorage.removeItem("MANUAL_LOGOUT");

        setToken(token);
        setUser(usuario);
        setSessionExpired(false);
    };

    const logout = (expired = false) => {
        setToken(null);
        setUser(null);
        setSessionExpired(expired);
    
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
    
        localStorage.removeItem("SESSION_EXPIRED");
    
        if (!expired) {
            localStorage.setItem("MANUAL_LOGOUT", "true");
        }
    };;

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
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
