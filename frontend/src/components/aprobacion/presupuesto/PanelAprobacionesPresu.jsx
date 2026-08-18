import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Search, Eye, AlertCircle, X, FileText } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api'; // O importa tus funciones de aprobPresuService
import Loading from '../../Loading';

export default function PanelAprobacionesPresu() {
    const { user } = useAuth();
    const permisos = user?.permisos || [];
    const puedeGestionar = permisos.includes('PERM_APROB_PRESU_GESTIONAR');

    const [activeTab, setActiveTab] = useState('PENDIENTE');
    const [presupuestos, setPresupuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedItem, setSelectedItem] = useState(null);
    const [procesando, setProcesando] = useState(false);

    const TABS = [
        { id: 'PENDIENTE', label: 'Pendientes', icon: Clock, color: 'text-orange-500' },
        { id: 'APROBADA', label: 'Aprobados', icon: CheckCircle, color: 'text-emerald-500' },
        { id: 'RECHAZADA', label: 'Rechazados', icon: XCircle, color: 'text-red-500' }
    ];

    useEffect(() => {
        cargarDatos(0, true);
    }, [activeTab]);

    const cargarDatos = async (pageToLoad = 0, reset = false) => {
        try {
            setLoading(true);
            // Reemplaza con tu función del service: listarAprobacionesPresupuesto(activeTab, pageToLoad)
            const res = await api.get(`/api/aprobaciones/presupuestos?estado=${activeTab}&page=${pageToLoad}&size=10`);
            const data = res.data?.contenido || res.data || [];

            if (reset) {
                setPresupuestos(data);
            } else {
                setPresupuestos(prev => [...prev, ...data]);
            }
            
            setHasMore(res.data?.ultima === false || data.length === 10);
        } catch (error) {
            console.error("Error cargando presupuestos", error);
            if (reset) setPresupuestos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDecidir = async (estadoDecision) => {
        if (!selectedItem) return;
        try {
            setProcesando(true);
            // Reemplaza con tu función: decidirAprobacionPresupuesto(selectedItem.idAprobacionPresupuesto, estadoDecision)
            await api.post(`/api/aprobaciones/presupuestos/${selectedItem.idAprobacionPresupuesto || selectedItem.id}`, {
                estado: estadoDecision
            });
            
            setSelectedItem(null);
            cargarDatos(0, true);
        } catch (error) {
            alert("Error al procesar: " + (error.response?.data?.error || error.message));
        } finally {
            setProcesando(false);
        }
    };

    const filtradas = presupuestos.filter(p => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return p.presupuesto?.proveedor?.nombreEmpresa?.toLowerCase().includes(term) || 
               p.presupuesto?.aprobacionSolicitud?.solicitud?.producto?.nombre?.toLowerCase().includes(term);
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
                        placeholder="Buscar proveedor o producto..."
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
                        <p>No hay presupuestos en estado {activeTab.toLowerCase()}.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Cotización ID</th>
                                <th className="px-6 py-4">Proveedor</th>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtradas.map((item) => (
                                <tr key={item.idAprobacionPresupuesto || item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">#{item.presupuesto?.idPresupuesto}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{item.presupuesto?.proveedor?.nombreEmpresa}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600">{item.presupuesto?.aprobacionSolicitud?.solicitud?.producto?.nombre}</div>
                                    </td>
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
                                {activeTab === 'PENDIENTE' && puedeGestionar ? 'Evaluar Presupuesto' : 'Detalles de Presupuesto'}
                            </h3>
                            <button onClick={() => setSelectedItem(null)} className="hover:opacity-80"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Cotización del Proveedor</p>
                                <p className="text-lg font-bold text-slate-800">{selectedItem.presupuesto?.proveedor?.nombreEmpresa}</p>
                                <p className="text-sm text-slate-600 mt-1">
                                    Producto a comprar: <strong>{selectedItem.presupuesto?.aprobacionSolicitud?.solicitud?.producto?.nombre}</strong>
                                </p>
                            </div>

                            {selectedItem.presupuesto?.observaciones && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Notas de Cotización</p>
                                    <p className="text-sm text-slate-700 bg-blue-50 p-3 rounded-lg italic border border-blue-100">
                                        "{selectedItem.presupuesto.observaciones}"
                                    </p>
                                </div>
                            )}

                            {selectedItem.presupuesto?.archivoPdfPath && (
                                <div className="pt-2">
                                    <p className="text-sm text-blue-600 font-bold flex items-center gap-2 cursor-pointer hover:underline"
                                       onClick={() => alert('Aquí va tu lógica de obtenerUrlPdf() para abrir el PDF.')}
                                    >
                                        <FileText size={18}/> Ver Cotización Adjunta (PDF)
                                    </p>
                                </div>
                            )}

                            {/* ZONA DE EVALUACIÓN */}
                            {activeTab === 'PENDIENTE' && puedeGestionar && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <p className="text-sm text-slate-600 mb-4 text-center">
                                        ¿Deseas autorizar la compra de este presupuesto?
                                    </p>
                                    <div className="flex gap-3">
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
                                            <CheckCircle size={18} /> Aprobar Compra
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