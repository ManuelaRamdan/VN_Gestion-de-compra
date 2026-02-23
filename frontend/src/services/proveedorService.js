import api from "./api";

export const listarProveedoresPaginados = async (page = 0, size = 10) => {
    return await api.get(`/api/proveedores/listar`, { params: { page, size } });
};

export const crearProveedor = async (data) => {
    return await api.post(`/api/proveedores/crear`, data);
};

export const modificarProveedor = async (idProveedor, data) => {
    return await api.put(`/api/proveedores/${idProveedor}`, data);
};

export const darDeBajaProveedor = async (idProveedor) => {
    return await api.patch(`/api/proveedores/${idProveedor}`);
};