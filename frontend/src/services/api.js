import axios from "axios";

const api = axios.create({
    //baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081",
    baseURL: "http://localhost:8081",
    withCredentials: true // Manda la cookie httpOnly automáticamente en cada request
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const manualLogout = sessionStorage.getItem("MANUAL_LOGOUT");

        if (error.config?.url?.includes("login")) {
            return Promise.reject(error);
        }

        if (status === 401 && !manualLogout) {
            sessionStorage.setItem("SESSION_EXPIRED", "true");
            window.location.replace("/");
        }

        return Promise.reject(error);
    }
);

export default api;