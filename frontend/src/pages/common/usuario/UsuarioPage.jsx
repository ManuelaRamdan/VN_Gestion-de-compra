import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import Loading from '../../../components/Loading';
import TablaUsuario from '../../../components/usuario/TablaUsuario';
import { listarUsuarios, darDeBajaUsuario, modificarUsuario, listarSectores } from '../../../services/usuarioService';
// Agregamos AlertTriangle para el modal de confirmación
import { Plus, Users, AlertCircle, Check, X, AlertTriangle } from 'lucide-react';

export default function UsuariosPanel() {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [sectores, setSectores] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [size] = useState(10); // cantidad por página
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Alertas tipo GestionCompra
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Estados del Modal de Edición
    const [showEditModal, setShowEditModal] = useState(false);
    const [modalError, setModalError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ username: "", password: "", idSector: "" });

    // NUEVO: Estado para el modal de confirmación de baja
    const [userToDeactivate, setUserToDeactivate] = useState(null);

    const cargarUsuarios = async (pageToLoad = 0, append = false) => {
        try {
            if (pageToLoad === 0) setLoading(true);
            else setIsLoadingMore(true);

            const res = await listarUsuarios(pageToLoad, size);

            const data = res.data?.contenido || [];
            const totalPages = res.data?.totalPaginas;

            setUsuarios(prev =>
                append ? [...prev, ...data] : data
            );

            setHasMore(pageToLoad + 1 < totalPages);
            setPage(pageToLoad);
        } catch (err) {
            setError("Error al cargar la lista de usuarios.");
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        const cargarInicial = async () => {
            try {
                setLoading(true);
                const resSectores = await listarSectores();
                setSectores(resSectores.data?.contenido || resSectores.data || []);
                await cargarUsuarios(0, false);
            } catch (err) {
                setError("Error al cargar datos.");
            } finally {
                setLoading(false);
            }
        };

        cargarInicial();
    }, []);

    const handleLoadMore = () => {
        if (!hasMore) return;
        cargarUsuarios(page + 1, true);
    };

    // --- LÓGICA DE BAJA ACTUALIZADA ---
    const handleDeactivateClick = (idUsuario) => {
        setUserToDeactivate(idUsuario); // Abrimos el modal seteando el ID
    };

    const confirmDeactivate = async () => {
        if (!userToDeactivate) return;
        
        try {
            await darDeBajaUsuario(userToDeactivate);
            setSuccess("Usuario dado de baja exitosamente.");
            // CORRECCIÓN: Usamos cargarUsuarios en lugar de cargarDatos
            cargarUsuarios(0, false); 
            setUserToDeactivate(null); // Cerramos el modal
            setTimeout(() => setSuccess(""), 3500);
        } catch (err) {
            setError(err.response?.data?.error || "Error al dar de baja al usuario.");
            setUserToDeactivate(null); // Cerramos el modal
        }
    };

    // --- ACCIÓN PARA EDITAR ---
    const handleEditClick = (usuario) => {
        setEditingId(usuario.idUsuario);
        setFormData({
            username: usuario.username,
            password: "", // Se deja vacío para no mostrarla
            idSector: usuario.sector?.idSector || ""
        });
        setModalError("");
        setShowEditModal(true);
    };

    // --- MODAL SUBMIT (EDICIÓN) ---
    const handleUpdate = async (e) => {
        e.preventDefault();
        setModalError("");
        try {
            await modificarUsuario(editingId, formData);
            setShowEditModal(false);
            setSuccess("Usuario actualizado correctamente.");
            // CORRECCIÓN: Usamos cargarUsuarios en lugar de cargarDatos
            cargarUsuarios(0, false); 
            setTimeout(() => setSuccess(""), 3500);
        } catch (err) {
            setModalError(err.response?.data?.error || "Error al actualizar el usuario.");
        }
    };

    //if (loading) return <Loading fullScreen />;

    return (
        <Layout>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Gestión de Usuarios</h1>
                    <p className="text-sm text-gray-500">Administre los accesos y roles del sistema.</p>
                </div>
                <button
                    onClick={() => navigate('/usuario/nuevo')} // Verifiqué que la ruta sea correcta según tu frontend
                    className="bg-[#1C5B5A] hover:bg-[#164a49] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={18} /> Nuevo Usuario
                </button>
            </div>

            {/* --- MENSAJES FEEDBACK GLOBALES --- */}
            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200 animate-in fade-in">
                    <AlertCircle size={16} /> {error}
                    <button onClick={() => setError("")} className="ml-auto hover:text-red-800"><X size={14} /></button>
                </div>
            )}

            {success && (
                <div className="mb-6 bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-emerald-200 animate-in fade-in slide-in-from-top-2">
                    <Check size={16} /> <span className="font-medium">{success}</span>
                    <button onClick={() => setSuccess("")} className="ml-auto hover:text-emerald-900"><X size={14} /></button>
                </div>
            )}

            {/* --- CONTENIDO --- */}
            {!loading && usuarios.length > 0 ? (
                <TablaUsuario
                    usuarios={usuarios}
                    onEdit={handleEditClick}
                    onDeactivate={handleDeactivateClick} // Pasamos la función que abre el modal
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                />
            ) : !loading && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Users className="text-slate-300" size={30} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Sin usuarios registrados</h3>
                </div>
            )}

            {/* --- MODAL DE EDICIÓN --- */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="bg-[#1C5B5A] px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">Modificar Usuario</h3>
                            <button onClick={() => setShowEditModal(false)}><X size={20} className="hover:text-emerald-200" /></button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            {modalError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                                    <AlertCircle size={16} /> {modalError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de Usuario</label>
                                <input
                                    type="text" required
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-emerald-500"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nueva Contraseña (Opcional)</label>
                                <input
                                    type="password"
                                    placeholder="Dejar en blanco para no cambiar"
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-emerald-500"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sector</label>
                                <select
                                    required
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-emerald-500"
                                    value={formData.idSector}
                                    onChange={e => setFormData({ ...formData, idSector: e.target.value })}
                                >
                                    <option value="">Seleccione un sector...</option>
                                    {sectores.map(sec => (
                                        <option key={sec.idSector} value={sec.idSector}>{sec.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50">Cancelar</button>
                                <button type="submit" className="flex-1 py-2.5 bg-[#1C5B5A] text-white rounded-lg text-sm font-medium hover:bg-[#164a49] shadow-md transition-all">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- NUEVO: MODAL DE CONFIRMACIÓN DE BAJA --- */}
            {userToDeactivate && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={30} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 mb-2">¿Dar de baja usuario?</h3>
                        <p className="text-sm text-gray-500 mb-6">Esta acción desactivará la cuenta del usuario impidiendo su acceso al sistema.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setUserToDeactivate(null)} 
                                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDeactivate} 
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-md transition-all"
                            >
                                Sí, dar de baja
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}