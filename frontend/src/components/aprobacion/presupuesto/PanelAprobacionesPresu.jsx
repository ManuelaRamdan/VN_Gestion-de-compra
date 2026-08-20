import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Search, Eye, Pencil, AlertCircle, X, FileStack } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import Loading from '../../Loading';
// Ajusta la ruta si GestionAprobPresu.jsx no está en la misma carpeta que este archivo
import GestionAprobPresu from './GestionAprobPresu';

export default function PanelAprobacionesPresu() {
    const { user } = useAuth();
    const permisos = user?.permisos || [];
    const puedeGestionar = permisos.includes('PERM_APROB_PRESU_GESTIONAR');

    const [activeTab, setActiveTab] = useState('PENDIENTE');
    // Ya NO guardamos la lista plana de AprobacionPresupuesto: la agrupamos por solicitud,
    // porque una solicitud puede tener entre 1 y 4 presupuestos asociados y hay que
    // evaluarlos/compararlos juntos, no de a uno.
    const [grupos, setGrupos] = useState([]); // [{ solicitud, presupuestosAsociados: [...] }]
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal de gestión (ver / evaluar grupo de presupuestos)
    const [selectedGrupo, setSelectedGrupo] = useState(null);

    // Feedback transitorio tras aprobar/rechazar
    const [toast, setToast] = useState("");

    const TABS = [
        { id: 'PENDIENTE', label: 'Pendientes', icon: Clock, color: 'text-orange-500' },
        { id: 'APROBADA', label: 'Aprobados', icon: CheckCircle, color: 'text-emerald-500' },
        { id: 'RECHAZADA', label: 'Rechazados', icon: XCircle, color: 'text-red-500' }
    ];

    useEffect(() => {
        cargarDatos();
    }, [activeTab]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(""), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    // Agrupa la lista plana de AprobacionPresupuesto por la solicitud a la que pertenecen.
    const agruparPorSolicitud = (items) => {
        const mapa = new Map();
        for (const item of items) {
            const solicitud = item.presupuesto?.aprobacionSolicitud?.solicitud;
            const idSolicitud = solicitud?.idSolicitud;
            if (!idSolicitud) continue; // dato incompleto, lo salteamos

            if (!mapa.has(idSolicitud)) {
                mapa.set(idSolicitud, { solicitud, presupuestosAsociados: [] });
            }
            mapa.get(idSolicitud).presupuestosAsociados.push(item);
        }
        return Array.from(mapa.values());
    };

    const cargarDatos = async () => {
        try {
            setLoading(true);
            // Traemos un size más grande de lo habitual para minimizar el riesgo de que
            // los presupuestos de una misma solicitud queden partidos entre dos páginas
            // al agruparlos acá. Si el volumen de aprobaciones abiertas crece mucho,
            // esto conviene resolverlo con un endpoint que agrupe del lado del backend.
            const res = await api.get(`/api/aprobaciones/presupuestos`, {
                params: { estado: activeTab, page: 0, size: 100 }
            });
            const data = res.data?.contenido || res.data || [];
            setGrupos(agruparPorSolicitud(data));
        } catch (error) {
            console.error("Error cargando presupuestos", error);
            setGrupos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = (mensaje) => {
        setToast(mensaje || "Operación realizada con éxito.");
        setSelectedGrupo(null);
        cargarDatos();
    };

    const filtrados = grupos.filter(g => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return g.solicitud?.producto?.nombre?.toLowerCase().includes(term) ||
               g.presupuestosAsociados.some(p => p.presupuesto?.proveedor?.nombreEmpresa?.toLowerCase().includes(term));
    });

    const esGestionable = activeTab === 'PENDIENTE' && puedeGestionar;

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
                            onClick={() => { setActiveTab(tab.id); setSearchTerm(""); }}
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

            {/* TABLA DE RESULTADOS (una fila por SOLICITUD, no por cotización) */}
            <div className="overflow-x-auto min-h-[300px]">
                {loading ? (
                    <Loading />
                ) : filtrados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10 text-slate-400">
                        <AlertCircle size={40} className="mb-2 opacity-50" />
                        <p>No hay solicitudes con presupuestos en estado {activeTab.toLowerCase()}.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Solicitud</th>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Cantidad</th>
                                <th className="px-6 py-4">Cotizaciones</th>
                                <th className="px-6 py-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtrados.map((grupo) => (
                                <tr key={grupo.solicitud.idSolicitud} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">#{grupo.solicitud.idSolicitud}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{grupo.solicitud?.producto?.nombre}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{grupo.solicitud?.cantidad} unidades</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded border border-slate-200">
                                            <FileStack size={12} />
                                            {grupo.presupuestosAsociados.length} cotización{grupo.presupuestosAsociados.length !== 1 ? 'es' : ''}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedGrupo(grupo)}
                                            className={`inline-flex items-center gap-1 font-bold text-xs px-3 py-1.5 rounded border transition-colors ${
                                                esGestionable
                                                    ? 'text-[#1C5B5A] bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
                                                    : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            {esGestionable ? (
                                                <><Pencil size={14} /> Evaluar</>
                                            ) : (
                                                <><Eye size={14} /> Ver Detalles</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL DE COMPARACIÓN / EVALUACIÓN (todas las cotizaciones de la solicitud) */}
            {selectedGrupo && (
                <GestionAprobPresu
                    grupoSeleccionado={selectedGrupo}
                    soloLectura={!esGestionable}
                    onClose={() => setSelectedGrupo(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}