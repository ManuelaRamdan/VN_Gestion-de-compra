import axios from "axios";

const api = axios.create({

    baseURL: "http://192.168.1.200:8081"

});

/*
Esos bloques son interceptores de Axios: código que se ejecuta automáticamente antes de cada petición y después de cada respuesta.
*/
//	Se ejecuta antes de cada petición HTTP hecha con api.
//config -> Objeto con la petición (URL, método, headers, etc.).
api.interceptors.request.use((config) => {

    //	Lee el token JWT guardado al hacer login.
    const token = localStorage.getItem("token");

    if (token && !config.url.includes("/login")) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});


//.interceptors.response.use(successFn, errorFn) -> successFn se usa con respuestas correctas, errorFn con errores.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const manualLogout = localStorage.getItem("MANUAL_LOGOUT");

        // 🚫 Si el error viene del login → NO redirigir
        if (error.config?.url?.includes("login")) {
            return Promise.reject(error);
        }

        if ((status === 401 || status === 403) && !manualLogout) {
            localStorage.setItem("SESSION_EXPIRED", "true");
            window.location.replace("/");
        }

        return Promise.reject(error);
    }
);

export default api;
/*
Petición (api.get, api.post...)
         │
         ▼
┌─────────────────────────┐
│  Interceptor REQUEST    │
│  Añade token al header  │
└─────────────────────────┘
         │
         ▼
    Envía al servidor
         │
         ▼
    Respuesta del servidor
         │
    ┌────┴────┐
    │         │
  200 OK   401/403
    │         │
    ▼         ▼
  Pasa       Interceptor RESPONSE
  tal cual   → Redirige a /
             → Guarda SESSION_EXPIRED
*/
