import api from "./api";


export const listarUsuarios = async (page = 0, size = 10) => {
    return await api.get(`/api/usuarios/`, { params: { page, size } });
};

export const registrarUsuario = async (data) => {
    return await api.post(`/api/usuarios/registrar`, data);
};

export const modificarUsuario = async (idUsuario, data) => {
    return await api.put(`/api/usuarios/${idUsuario}`, data);
};

export const darDeBajaUsuario = async (idUsuario) => {
    return await api.patch(`/api/usuarios/${idUsuario}`);
};

export const listarSectores = async () => {
    return await api.get('/api/sectores/listar'); 
};