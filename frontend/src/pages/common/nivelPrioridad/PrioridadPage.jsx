import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import TablaPrioridad from '../../../components/nivelPrioridad/TablaPrioridad';
import { listarPrioridadesPaginadas, darDeBajaPrioridad, modificarPrioridad, crearPrioridad } from '../../../services/prioridadService';
import { Plus, Flag, AlertCircle, Check, X, AlertTriangle } from 'lucide-react'; 

export default function PrioridadPage() {
    const [prioridades, setPrioridades] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Alertas
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Modal unificado (Crear / Editar)
    const [showModal, setShowModal] = useState(false); 
    const [modalError, setModalError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ categoria: "", dias: "" });

    // Estado para el modal de confirmación de baja
    const [prioridadToDeactivate, setPrioridadToDeactivate] = useState(null);

    const cargarPrioridades = async (pageToLoad = 0, append = false) => {
        try {
            if (pageToLoad === 0) setLoading(true);
            else setIsLoadingMore(true);

            const res = await listarPrioridadesPaginadas(pageToLoad, size);
            const data = res.data?.contenido || [];
            const totalPages = res.data?.totalPaginas;

            setPrioridades(prev => append ? [...prev, ...data] : data);
            setHasMore(pageToLoad + 1 < totalPages);
            setPage(pageToLoad);
        } catch (err) {
            setError("Error al cargar los niveles de prioridad.");
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        cargarPrioridades(0, false);
    }, []);

    const handleLoadMore = () => {
        if (!hasMore) return;
        cargarPrioridades(page + 1, true);
    };

    // --- LÓGICA DE BAJA ---
    const handleDeactivateClick = (idNivelPrioridad) => {
        setPrioridadToDeactivate(idNivelPrioridad);
    };

    const confirmDeactivate = async () => {
        if (!prioridadToDeactivate) return;
        
        try {
            await darDeBajaPrioridad(prioridadToDeactivate);
            setSuccess("Nivel de prioridad dado de baja exitosamente.");
            cargarPrioridades(0, false);
            setPrioridadToDeactivate(null); 
            setTimeout(() => setSuccess(""), 3500);
        } catch (err) {
            setError(err.response?.data?.error || "Error al dar de baja el nivel de prioridad.");
            setPrioridadToDeactivate(null); 
        }
    };

    // --- ACCIONES PARA ABRIR EL MODAL ---
    const handleNuevoClick = () => {
        setEditingId(null); 
        setFormData({ categoria: "", dias: "" }); 
        setModalError("");
        setShowModal(true);
    };

    const handleEditClick = (prioridad) => {
        setEditingId(prioridad.idNivelPrioridad); 
        setFormData({ categoria: prioridad.categoria, dias: prioridad.dias }); 
        setModalError("");
        setShowModal(true);
    };

    // --- GUARDADO UNIFICADO ---
    const handleGuardar = async (e) => {
        e.preventDefault();
        setModalError("");

        try {
            // Aseguramos que los días viajen como número al backend
            const payload = {
                categoria: formData.categoria,
                dias: parseInt(formData.dias)
            };

            if (editingId) {
                await modificarPrioridad(editingId, payload);
                setSuccess("Nivel de prioridad actualizado correctamente.");
            } else {
                await crearPrioridad(payload);
                setSuccess("Nivel de prioridad registrado correctamente.");
            }
            
            setShowModal(false);
            cargarPrioridades(0, false); 
            setTimeout(() => setSuccess(""), 3500);
        } catch (err) {
            setModalError(err.response?.data?.error || "Error al guardar el nivel de prioridad.");
        }
    };

    return (
        <Layout>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Niveles de Prioridad</h1>
                    <p className="text-sm text-gray-500">Gestione las categorías y tiempos límite de las solicitudes.</p>
                </div>
                <button
                    onClick={handleNuevoClick} 
                    className="bg-[#1C5B5A] hover:bg-[#164a49] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
                >
                    <Plus size={18} /> Nueva Prioridad
                </button>
            </div>

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

            {!loading && prioridades.length > 0 ? (
                <TablaPrioridad
                    prioridades={prioridades}
                    onEdit={handleEditClick}
                    onDeactivate={handleDeactivateClick}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    isLoadingMore={isLoadingMore}
                />
            ) : !loading && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Flag className="text-slate-300" size={30} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Sin prioridades registradas</h3>
                </div>
            )}

            {/* --- Modal Unificado de Edición / Creación --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="bg-[#1C5B5A] px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">{editingId ? "Modificar Prioridad" : "Nueva Prioridad"}</h3>
                            <button onClick={() => setShowModal(false)}><X size={20} className="hover:text-emerald-200" /></button>
                        </div>

                        <form onSubmit={handleGuardar} className="p-6 space-y-4">
                            {modalError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                                    <AlertCircle size={16} /> {modalError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre / Categoría</label>
                                <input
                                    type="text" required
                                    placeholder="ej. Urgente, Normal..."
                                    className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:border-emerald-500"
                                    value={formData.categoria}
                                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Días Límite</label>
                                <div className="flex items-center">
                                    <input
                                        type="number" required min="1"
                                        placeholder="ej. 5"
                                        className="w-full border border-r-0 border-slate-300 rounded-l-lg p-2 text-sm outline-none focus:border-emerald-500"
                                        value={formData.dias}
                                        onChange={e => setFormData({ ...formData, dias: e.target.value })}
                                    />
                                    <span className="bg-slate-50 border border-slate-300 border-l-0 text-slate-500 text-sm px-4 py-2 rounded-r-lg">
                                        Días
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-2.5 bg-[#1C5B5A] text-white rounded-lg text-sm font-medium hover:bg-[#164a49] shadow-md transition-all">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Modal de Confirmación de Baja --- */}
            {prioridadToDeactivate && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={30} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 mb-2">¿Dar de baja prioridad?</h3>
                        <p className="text-sm text-gray-500 mb-6">Esta acción ocultará el nivel de prioridad para futuras solicitudes del sistema.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setPrioridadToDeactivate(null)} 
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