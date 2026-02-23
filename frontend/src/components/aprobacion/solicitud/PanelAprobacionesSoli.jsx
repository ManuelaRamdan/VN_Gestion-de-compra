import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Search, Eye, AlertCircle, X } from 'lucide-react';
import { listarAprobacionesSoli } from '../../../services/aprobSoliService';
import Loading from '../../Loading';
import ModalGestionSolicitud from './GestionAprobSolicitud';

export default function PanelAprobacionesSoli() {
    const [activeTab, setActiveTab] = useState('PENDIENTE');
    const [aprobaciones, setAprobaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

    // --- ESTADOS DE FEEDBACK ---
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- ESTADOS DE PAGINACIÓN ---
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const PAGE_SIZE = 10; // Ajusta este valor según lo que devuelva tu backend

    const tabs = [
        { id: 'PENDIENTE', label: 'Pendientes', icon: Clock, color: 'text-orange-500' },
        { id: 'APROBADA', label: 'Aprobadas', icon: CheckCircle, color: 'text-emerald-500' },
        { id: 'RECHAZADA', label: 'Rechazadas', icon: XCircle, color: 'text-red-500' }
    ];

    // Modificamos cargarDatos para aceptar la página y saber si es una carga inicial o un "Ver más"
    const cargarDatos = async (numeroPagina = 0, esCargaAdicional = false) => {
        if (esCargaAdicional) {
            setIsLoadingMore(true);
        } else {
            setLoading(true);
            setError('');
        }

        try {
            // Asegúrate de que tu servicio acepte los parámetros de paginación (ej: page, size)
            const res = await listarAprobacionesSoli(activeTab, numeroPagina, PAGE_SIZE);
            const dataObj = res.data ? res.data : res;
            const arrayFinal = dataObj.contenido ? dataObj.contenido : (Array.isArray(dataObj) ? dataObj : []);

            if (esCargaAdicional) {
                setAprobaciones(prev => [...prev, ...arrayFinal]);
            } else {
                setAprobaciones(arrayFinal);
            }

            // Validamos si hay más elementos para la siguiente página
            // Dependiendo de tu backend, esto podría ser dataObj.last === false, o midiendo el length:
            setHasMore(arrayFinal.length === PAGE_SIZE);
            setPage(numeroPagina);

        } catch (error) {
            console.error("Error al cargar aprobaciones", error);
            setError("No se pudieron cargar las solicitudes. Verifique la conexión.");
            if (!esCargaAdicional) setAprobaciones([]);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    // Al cambiar de pestaña, reiniciamos a la página 0
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

    const filteredData = aprobaciones.filter(item => {
        const term = searchTerm.toLowerCase();
        const producto = item.solicitud?.producto?.nombre?.toLowerCase() || "";
        const idSoli = item.solicitud?.idSolicitud?.toString() || "";
        return producto.includes(term) || idSoli.includes(term);
    });

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Panel de Aprobaciones de solicitudes</h1>
                <p className="text-sm text-gray-500">Gestione y evalúe las solicitudes.</p>
            </div>

            {/* --- ALERTAS --- */}
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
                <h2 className="text-base font-bold text-slate-800">Seleccione una solicitud</h2>

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
                                    <th className="px-6 py-4">ID SOLICITUD</th>
                                    <th className="px-6 py-4">PRODUCTO</th>
                                    <th className="px-6 py-4">CANTIDAD</th>
                                    <th className="px-6 py-4">SOLICITANTE</th>
                                    <th className="px-6 py-4 text-right">ACCIÓN</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr key={item.id || item.solicitud?.idSolicitud} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-slate-800">#SOL-{item.solicitud?.idSolicitud}</div>
                                                <div className="text-[11px] text-gray-400">
                                                    {new Date(item.solicitud?.fecha).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                                {item.solicitud?.producto?.nombre}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {item.solicitud?.cantidad} un.
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {item.solicitud?.usuario?.username}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSolicitudSeleccionada(item)}
                                                    className="inline-flex items-center gap-1 text-[#1C5B5A] font-bold text-xs hover:underline"
                                                >
                                                    <Eye size={14} /> {activeTab === 'PENDIENTE' ? 'Evaluar' : 'Ver Detalle'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-gray-400 text-sm">
                                            No se encontraron solicitudes {activeTab.toLowerCase()}s.
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

            {/* Modal de Gestión/Edición */}
            {solicitudSeleccionada && (
                <ModalGestionSolicitud
                    aprobacion={solicitudSeleccionada}
                    soloLectura={activeTab !== 'PENDIENTE'}
                    onClose={() => setSolicitudSeleccionada(null)}
                    onSuccess={(mensajeExito) => {
                        setSolicitudSeleccionada(null);
                        setSuccess(mensajeExito || "Operación realizada correctamente");
                        setTimeout(() => setSuccess(""), 3500);
                        // Al modificar una, recargamos desde la página 0 para refrescar todo
                        cargarDatos(0, false);
                    }}
                />
            )}
        </div>
    );
}