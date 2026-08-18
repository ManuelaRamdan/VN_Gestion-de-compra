import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Search, Eye, AlertCircle, X, MessageSquare } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api'; // O importa tus funciones de aprobSoliService
import Loading from '../../Loading';

export default function PanelAprobacionesSoli() {
    const { user } = useAuth();
    const permisos = user?.permisos || [];
    const puedeGestionar = permisos.includes('PERM_APROB_SOLI_GESTIONAR');

    const [activeTab, setActiveTab] = useState('PENDIENTE');
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Paginación y búsqueda
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal de evaluación
    const [selectedItem, setSelectedItem] = useState(null);
    const [comentariosDecision, setComentariosDecision] = useState("");
    const [procesando, setProcesando] = useState(false);

    const TABS = [
        { id: 'PENDIENTE', label: 'Pendientes', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
        { id: 'APROBADA', label: 'Aprobadas', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        { id: 'RECHAZADA', label: 'Rechazadas', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' }
    ];

    useEffect(() => {
        cargarDatos(0, true);
    }, [activeTab]);

    const cargarDatos = async (pageToLoad = 0, reset = false) => {
        try {
            setLoading(true);
            // Reemplaza con tu función del service: listarAprobacionesSolicitud(activeTab, pageToLoad)
            const res = await api.get(`/api/aprobaciones/solicitudes?estado=${activeTab}&page=${pageToLoad}&size=10`);
            const data = res.data?.contenido || res.data || [];

            if (reset) {
                setSolicitudes(data);
            } else {
                setSolicitudes(prev => [...prev, ...data]);
            }
            
            setHasMore(res.data?.ultima === false || data.length === 10);
        } catch (error) {
            console.error("Error cargando solicitudes", error);
            if (reset) setSolicitudes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDecidir = async (estadoDecision) => {
        if (!selectedItem) return;
        try {
            setProcesando(true);
            // Reemplaza con tu función: decidirAprobacionSolicitud(selectedItem.idAprobSolicitud, estadoDecision, comentariosDecision)
            await api.post(`/api/aprobaciones/solicitudes/${selectedItem.idAprobSolicitud || selectedItem.id}`, {
                estado: estadoDecision,
                comentarios: comentariosDecision
            });
            
            setSelectedItem(null);
            setComentariosDecision("");
            cargarDatos(0, true); // Recargar la lista
        } catch (error) {
            alert("Error al procesar: " + (error.response?.data?.error || error.message));
        } finally {
            setProcesando(false);
        }
    };

    const filtradas = solicitudes.filter(s => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return s.solicitud?.producto?.nombre?.toLowerCase().includes(term) || 
               s.solicitud?.usuario?.username?.toLowerCase().includes(term);
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* TABS HEADER */}
            <div className="flex flex-wrap border-b border-slate-200 bg-slate-50">
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setPage(0); setSearchTerm(""); }}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 ${
                                isActive ? `bg-white ${tab.color} border-[#1C5B5A]` : 'text-slate-500 border-transparent hover:bg-slate-100'
                            }`}
                        >
                            <Icon size={18} className={isActive ? tab.color : 'text-slate-400'} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* BARRA BÚSQUEDA */}
            <div className="p-4 border-b border-slate-100 flex justify-end">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar producto o solicitante..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* TABLA DE RESULTADOS */}
            <div className="overflow-x-auto min-h-[300px]">
                {loading && page === 0 ? (
                    <Loading />
                ) : filtradas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10 text-slate-400">
                        <AlertCircle size={40} className="mb-2 opacity-50" />
                        <p>No hay solicitudes en estado {activeTab.toLowerCase()}.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Prioridad</th>
                                <th className="px-6 py-4">Solicitante</th>
                                <th className="px-6 py-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtradas.map((item) => (
                                <tr key={item.idAprobSolicitud || item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">#{item.idAprobSolicitud || item.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{item.solicitud?.producto?.nombre}</div>
                                        <div className="text-xs text-gray-500">{item.solicitud?.cantidad} unidades</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded border border-slate-200">
                                            {item.solicitud?.nivelPrioridad?.categoria || 'NORMAL'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{item.solicitud?.usuario?.username}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedItem(item)}
                                            className="inline-flex items-center gap-1 text-[#1C5B5A] font-bold text-xs hover:underline bg-emerald-50 px-3 py-1.5 rounded border border-emerald-100"
                                        >
                                            <Eye size={14} /> {activeTab === 'PENDIENTE' && puedeGestionar ? 'Evaluar' : 'Ver Detalles'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL DE DETALLES / EVALUACIÓN */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
                        <div className={`px-6 py-4 flex justify-between items-center text-white ${
                            activeTab === 'APROBADA' ? 'bg-emerald-600' : 
                            activeTab === 'RECHAZADA' ? 'bg-red-600' : 'bg-[#1C5B5A]'
                        }`}>
                            <h3 className="font-bold text-lg">
                                {activeTab === 'PENDIENTE' && puedeGestionar ? 'Evaluar Solicitud' : 'Detalles de Solicitud'}
                            </h3>
                            <button onClick={() => setSelectedItem(null)} className="hover:opacity-80"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Producto Solicitado</p>
                                <p className="text-lg font-bold text-slate-800">{selectedItem.solicitud?.producto?.nombre}</p>
                                <p className="text-sm text-slate-600 mt-1">Cantidad: {selectedItem.solicitud?.cantidad} unidades</p>
                            </div>

                            {selectedItem.solicitud?.comentarios && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Justificación del Solicitante</p>
                                    <p className="text-sm text-slate-700 bg-blue-50 p-3 rounded-lg italic border border-blue-100">
                                        "{selectedItem.solicitud.comentarios}"
                                    </p>
                                </div>
                            )}

                            {activeTab !== 'PENDIENTE' && selectedItem.comentarios && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Comentario de Gerencia</p>
                                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg italic border border-slate-200">
                                        "{selectedItem.comentarios}"
                                    </p>
                                </div>
                            )}

                            {/* ZONA DE EVALUACIÓN (Solo si está pendiente y tiene permiso) */}
                            {activeTab === 'PENDIENTE' && puedeGestionar && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Comentarios de Evaluación (Opcional)</label>
                                    <textarea
                                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:border-[#1C5B5A] outline-none resize-none"
                                        rows="3"
                                        placeholder="Escribe el motivo de la aprobación o rechazo..."
                                        value={comentariosDecision}
                                        onChange={(e) => setComentariosDecision(e.target.value)}
                                    ></textarea>

                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => handleDecidir('RECHAZADA')}
                                            disabled={procesando}
                                            className="flex-1 py-3 bg-red-100 text-red-700 font-bold rounded-lg border border-red-200 hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={18} /> Rechazar
                                        </button>
                                        <button
                                            onClick={() => handleDecidir('APROBADA')}
                                            disabled={procesando}
                                            className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={18} /> Aprobar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}