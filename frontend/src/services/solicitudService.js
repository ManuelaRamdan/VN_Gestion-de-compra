import api from "./api";

export const misSolicitudes = async (page = 0, size=10) => {
    return api.get(`/api/solicitudes/misSolicitudes?page=${page}&size=${size}`);
};

export const crearSolicitud = async (solicitudData) => {
    return api.post("api/solicitudes/crear", solicitudData);

};

export const listarProductos = async () => {
    return api.get("/api/productos/listar"); 
};

export const listarPrioridades = async () => {
    return api.get("/api/prioridades/listar");
};
/*
Formulario login (input usuario, input contraseña)
         │
         ▼
loginRequest(username, password)
         │
         ▼
api.post("api/usuarios/login", { username, password })
         │
         ▼
HTTP POST
Headers: Content-Type: application/json
Body: {"username":"juan","password":"123"}
         │
         ▼
Backend recibe el body como JSON*/ 