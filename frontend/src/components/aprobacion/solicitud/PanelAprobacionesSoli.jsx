import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Search, Eye, Pencil, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import Loading from '../../Loading';
// Ajusta la ruta si GestionAprobSolicitud.jsx no está en la misma carpeta que este archivo
import GestionAprobSolicitud from './GestionAprobSolicitud';

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

    // Modal de gestión (ver / editar / evaluar)
    const [selectedItem, setSelectedItem] = useState(null);

    // Feedback transitorio tras guardar/evaluar
    const [toast, setToast] = useState("");

    const TABS = [
        { id: 'PENDIENTE', label: 'Pendientes', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
        { id: 'APROBADA', label: 'Aprobadas', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        { id: 'RECHAZADA', label: 'Rechazadas', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' }
    ];

    useEffect(() => {
        cargarDatos(0, true);
    }, [activeTab]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(""), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    const cargarDatos = async (pageToLoad = 0, reset = false) => {
        try {
            setLoading(true);
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

    // Se llama desde GestionAprobSolicitud tanto al guardar cambios de la solicitud
    // como al aprobar/rechazar. En ambos casos refrescamos la lista.
    const handleSuccess = (mensaje) => {
        setToast(mensaje || "Operación realizada con éxito.");
        setSelectedItem(null);
        cargarDatos(0, true);
    };

    const filtradas = solicitudes.filter(s => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return s.solicitud?.producto?.nombre?.toLowerCase().includes(term) ||
               s.solicitud?.usuario?.username?.toLowerCase().includes(term);
    });

    // Un ítem es "gestionable" (editar + evaluar) si está PENDIENTE y el usuario tiene el permiso.
    // Si no, se abre en modo solo lectura.
    const esGestionable = (item) => {
        const estado = item.estado || activeTab;
        return estado === 'PENDIENTE' && puedeGestionar;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
            {/* TOAST */}
            {toast && (
                <div className="absolute top-4 right-4 z-40 bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in">
                    <CheckCircle size={16} /> {toast}
                    <button onClick={() => setToast("")} className="ml-2 hover:opacity-80"><X size={14} /></button>
                </div>
            )}

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
                            {filtradas.map((item) => {
                                const gestionable = esGestionable(item);
                                return (
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
                                                className={`inline-flex items-center gap-1 font-bold text-xs px-3 py-1.5 rounded border transition-colors ${
                                                    gestionable
                                                        ? 'text-[#1C5B5A] bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
                                                        : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100'
                                                }`}
                                            >
                                                {gestionable ? (
                                                    <><Pencil size={14} /> Editar / Evaluar</>
                                                ) : (
                                                    <><Eye size={14} /> Ver Detalles</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL DE GESTIÓN (ver / editar / evaluar) */}
            {selectedItem && (
                <GestionAprobSolicitud
                    aprobacion={selectedItem}
                    soloLectura={!puedeGestionar}
                    onClose={() => setSelectedItem(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}