import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8081"
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");

    if (token && !config.url.includes("/login")) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
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