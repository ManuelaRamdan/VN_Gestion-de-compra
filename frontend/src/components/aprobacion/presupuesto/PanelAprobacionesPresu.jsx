import React, { useEffect, useState } from 'react';
import { Clock, Archive, Search, Eye, AlertCircle, X, Package, CheckCircle } from 'lucide-react';
import { listarAprobacionesPresupuesto } from '../../../services/aprobPresuService'; 
import Loading from '../../Loading';
import ModalGestionAprobPresu from './GestionAprobPresu';

// Función para arreglar el problema de la zona horaria con LocalDate
export const formatDateLocal = (dateString) => {
    if (!dateString) return 'N/A';
    // Si viene como '2026-02-25', le agregamos 'T00:00:00' para que no lo asuma como UTC
    const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString();
};

export default function PanelAprobacionesPresu() {
    const [activeTab, setActiveTab] = useState('PENDIENTE');
    const [aprobacionesAgrupadas, setAprobacionesAgrupadas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const PAGE_SIZE = 10; 

    // Solo dos pestañas
    const tabs = [
        { id: 'PENDIENTE', label: 'Pendientes', icon: Clock, color: 'text-orange-500' },
        { id: 'EVALUADA', label: 'Evaluadas', icon: Archive, color: 'text-indigo-500' }
    ];

    const cargarDatos = async (numeroPagina = 0, esCargaAdicional = false) => {
        if (esCargaAdicional) {
            setIsLoadingMore(true);
        } else {
            setLoading(true);
            setError('');
        }

        try {
            let rawList = [];

            // Si es EVALUADA, hacemos dos llamadas en paralelo y las unimos
            if (activeTab === 'EVALUADA') {
                const [resAprobadas, resRechazadas] = await Promise.all([
                    listarAprobacionesPresupuesto('APROBADA', numeroPagina, PAGE_SIZE),
                    listarAprobacionesPresupuesto('RECHAZADA', numeroPagina, PAGE_SIZE)
                ]);

                const dataAprob = resAprobadas.data ? resAprobadas.data : resAprobadas;
                const dataRech = resRechazadas.data ? resRechazadas.data : resRechazadas;

                const listaAprob = dataAprob.contenido ? dataAprob.contenido : (Array.isArray(dataAprob) ? dataAprob : []);
                const listaRech = dataRech.contenido ? dataRech.contenido : (Array.isArray(dataRech) ? dataRech : []);

                // Unimos ambas respuestas
                rawList = [...listaAprob, ...listaRech];

                // Evaluamos si hay más páginas en ALGUNA de las dos listas
                setHasMore(listaAprob.length === PAGE_SIZE || listaRech.length === PAGE_SIZE);

            } else {
                // Si es PENDIENTE, hacemos la llamada normal
                const res = await listarAprobacionesPresupuesto(activeTab, numeroPagina, PAGE_SIZE);
                const dataObj = res.data ? res.data : res;
                rawList = dataObj.contenido ? dataObj.contenido : (Array.isArray(dataObj) ? dataObj : []);
                
                setHasMore(rawList.length === PAGE_SIZE);
            }

            // --- LÓGICA DE AGRUPACIÓN (Se mantiene igual) ---
            setAprobacionesAgrupadas(prevGrupos => {
                const grouped = new Map();

                if (esCargaAdicional) {
                    prevGrupos.forEach(grupo => {
                        grouped.set(grupo.solicitud.idSolicitud, { 
                            ...grupo, 
                            presupuestosAsociados: [...grupo.presupuestosAsociados] 
                        });
                    });
                }

                rawList.forEach(item => {
                    const idSoli = item.presupuesto?.aprobacionSolicitud?.solicitud?.idSolicitud;
                    if (idSoli) {
                        if (!grouped.has(idSoli)) {
                            grouped.set(idSoli, {
                                solicitud: item.presupuesto.aprobacionSolicitud.solicitud,
                                aprobacionSolicitud: item.presupuesto.aprobacionSolicitud,
                                presupuestosAsociados: []
                            });
                        }
                        // Insertamos el presupuesto al grupo
                        grouped.get(idSoli).presupuestosAsociados.push(item);
                    }
                });

                return Array.from(grouped.values());
            });

            setPage(numeroPagina);

        } catch (error) {
            console.error("Error al cargar", error);
            setError("No se pudieron cargar los presupuestos.");
            if (!esCargaAdicional) setAprobacionesAgrupadas([]);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        cargarDatos(0, false);
        setSearchTerm('');
        setSuccess('');
        setError('');
    }, [activeTab]);

    const handleLoadMore = () => {
        if (!isLoadingMore && hasMore) {
            cargarDatos(page + 1, true);
        }
    };

    const filteredData = aprobacionesAgrupadas.filter(grupo => {
        const term = searchTerm.toLowerCase();
        const producto = grupo.solicitud?.producto?.nombre?.toLowerCase() || "";
        const idSoli = grupo.solicitud?.idSolicitud?.toString() || "";
        const proveedores = grupo.presupuestosAsociados.map(p => p.presupuesto?.proveedor?.nombreEmpresa?.toLowerCase()).join(" ");

        return producto.includes(term) || idSoli.includes(term) || proveedores.includes(term);
    });

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Panel de Aprobaciones de Presupuestos</h1>
                <p className="text-sm text-gray-500">Gestione y evalúe los presupuestos para las solicitudes aprobadas.</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200 animate-in fade-in">
                    <AlertCircle size={16} /> {error}
                    <button onClick={() => setError("")} className="ml-auto hover:text-red-800"><X size={14} /></button>
                </div>
            )}

            {success && (
                <div className="mb-6 bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-emerald-200 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle size={16} /> <span className="font-medium">{success}</span>
                    <button onClick={() => setSuccess("")} className="ml-auto hover:text-emerald-900"><X size={14} /></button>
                </div>
            )}

            {/* Navegación de Pestañas */}
            <div className="flex border-b border-slate-200 mb-6 gap-6">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${isActive
                                    ? `border-[#1C5B5A] text-[#1C5B5A]`
                                    : `border-transparent text-slate-400 hover:text-slate-600`
                                }`}
                        >
                            <Icon size={18} className={isActive ? tab.color : 'text-slate-400'} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Controles de Búsqueda */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-base font-bold text-slate-800">
                        {activeTab === 'PENDIENTE' ? 'Solicitudes con presupuestos pendientes' : 'Solicitudes evaluadas'}
                    </h2>

                    <div className="relative w-full sm:w-64 ml-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar por ID, proveedor, producto..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabla */}
                {loading ? (
                    <div className="p-10"><Loading /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F8F9FC] text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">APROB SOLICITUD</th>
                                    <th className="px-6 py-4">PRODUCTO</th>
                                    <th className="px-6 py-4">CANTIDAD</th>
                                    <th className="px-6 py-4">PRESUPUESTOS</th>
                                    <th className="px-6 py-4 text-right">ACCIÓN</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredData.length > 0 ? (
                                    filteredData.map((grupo) => (
                                        <tr key={grupo.solicitud.idSolicitud} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-slate-800">
                                                    #APROB-{grupo.aprobacionSolicitud?.id}
                                                </div>
                                                <div className="text-[11px] text-gray-400">
                                                    {formatDateLocal(grupo.aprobacionSolicitud?.fecha)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                                {grupo.solicitud.producto?.nombre}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {grupo.solicitud.cantidad} un.
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-blue-50 text-blue-600 px-2 py-1.5 rounded font-bold text-[10px] flex items-center gap-1 w-max border border-blue-100">
                                                    <Package size={12} /> {grupo.presupuestosAsociados.length} OPCIONES
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setGrupoSeleccionado(grupo)}
                                                    className="inline-flex items-center gap-1 text-[#1C5B5A] font-bold text-xs hover:underline"
                                                >
                                                    <Eye size={14} /> {activeTab === 'PENDIENTE' ? 'Comparar y Evaluar' : 'Ver Detalles'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-gray-400 text-sm">
                                            No se encontraron presupuestos {activeTab.toLowerCase()}s.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* --- BOTÓN VER MÁS --- */}
                        {hasMore && filteredData.length > 0 && (
                            <div className="p-4 bg-white border-t border-slate-50 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="text-xs text-gray-400 hover:text-[#1C5B5A] flex items-center gap-1 transition-colors font-medium disabled:opacity-50"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-[#1C5B5A] border-t-transparent rounded-full animate-spin"></div>
                                            Cargando...
                                        </>
                                    ) : (
                                        "Ver más"
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Gestión */}
            {grupoSeleccionado && (
                <ModalGestionAprobPresu
                    grupoSeleccionado={grupoSeleccionado}
                    soloLectura={activeTab !== 'PENDIENTE'}
                    onClose={() => setGrupoSeleccionado(null)}
                    onSuccess={(mensajeExito) => {
                        setGrupoSeleccionado(null);
                        setSuccess(mensajeExito || "Operación realizada correctamente");
                        setTimeout(() => setSuccess(""), 3500);
                        cargarDatos(0, false); 
                    }}
                />
            )}
        </div>
    );
}