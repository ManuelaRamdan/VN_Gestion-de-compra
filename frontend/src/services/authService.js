import api from "./api";

export const loginRequest = async (username, password) => {
    return api.post("/api/usuarios/login", { username, password });

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