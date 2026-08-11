import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = sessionStorage.getItem("token");
        const u = sessionStorage.getItem("usuario");
        const expired = sessionStorage.getItem("SESSION_EXPIRED");

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
        sessionStorage.setItem("token", token);
        //sessionStorage solo guarda strings. Al guardar un objeto usas JSON.stringify:
        sessionStorage.setItem("usuario", JSON.stringify(usuario));
        sessionStorage.removeItem("SESSION_EXPIRED");
        sessionStorage.removeItem("MANUAL_LOGOUT");

        setToken(token);
        setUser(usuario);
        setSessionExpired(false);
    };

    const logout = (expired = false) => {
        setToken(null);
        setUser(null);
        setSessionExpired(expired);
    
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("usuario");
    
        sessionStorage.removeItem("SESSION_EXPIRED");
    
        if (!expired) {
            sessionStorage.setItem("MANUAL_LOGOUT", "true");
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