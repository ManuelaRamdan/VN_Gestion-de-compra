import React, { useState } from 'react';
import { Search, ChevronDown, FileText } from 'lucide-react';

export default function TablaSolicitud({ solicitudes, onViewDetails, onLoadMore, hasMore, isLoadingMore }) {
    const [searchTerm, setSearchTerm] = useState("");

    // Helpers de formato (puedes moverlos a utils si quieres)
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getPriorityBadge = (prioridadObj) => {
        const cat = prioridadObj?.categoria || "";
        const catLower = cat.toLowerCase();
        const isUrgent = catLower.includes('inmediata') || catLower.includes('alta');
        const isMedium = catLower.includes('media');

        if (isUrgent) return <span className="px-2 py-1 text-[10px] font-bold text-red-600 bg-red-50 rounded border border-red-100 uppercase">INMEDIATA</span>;
        if (isMedium) return <span className="px-2 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 rounded border border-blue-100 uppercase">MEDIA</span>;
        return <span className="px-2 py-1 text-[10px] font-bold text-gray-600 bg-gray-100 rounded border border-gray-200 uppercase">BAJA</span>;
    };

    const getStatusIndicator = (estado) => {
        let colorClass = 'bg-gray-400';
        let text = estado || 'Desconocido';

        if (estado === 'PENDIENTE') { colorClass = 'bg-yellow-400'; text = 'Pendiente'; }
        else if (estado === 'APROBADA') { colorClass = 'bg-emerald-500'; text = 'Aprobada'; }
        else if (estado === 'RECHAZADA') { colorClass = 'bg-red-500'; text = 'Rechazada'; }

        return (
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>
                <span className="text-sm font-medium text-gray-700 capitalize">{text}</span>
            </div>
        );
    };

    // Lógica de filtrado
    const filteredData = solicitudes.filter((item) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();

        // Buscamos en varios campos a la vez
        return (
            item.fecha?.toLowerCase().includes(term) ||
            item.producto?.nombre?.toLowerCase().includes(term) ||
            item.nivelPrioridad?.categoria?.toLowerCase().includes(term) ||
            item.aprobacion?.estado?.toLowerCase().includes(term) ||
            item.idSolicitud.toString().includes(term)
        );
    });

    return (
        <div className="bg-white rounded-lg shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
            {/* Header de la tabla con Buscador */}
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-base font-bold text-slate-800">Listado de Solicitudes</h2>

                {/* Buscador */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por fecha, producto..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredData.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8F9FC] text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="px-6 py-4">FECHA</th>
                                <th className="px-6 py-4">PRODUCTO / SERVICIO</th>
                                <th className="px-6 py-4">PRIORIDAD</th>
                                <th className="px-6 py-4">ESTADO</th>
                                <th className="px-6 py-4 text-right">ACCION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredData.map((solicitud) => (
                                <tr key={solicitud.idSolicitud} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                        {formatDate(solicitud.fecha)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 text-sm">{solicitud.producto?.nombre}</span>
                                            <span className="text-[11px] text-gray-400">REQ-{solicitud.idSolicitud} • {solicitud.cantidad} Units</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getPriorityBadge(solicitud.nivelPrioridad)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusIndicator(solicitud.aprobacion?.estado)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => onViewDetails(solicitud)}
                                            className="text-[#1C5B5A] font-bold text-xs hover:underline cursor-pointer"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {hasMore && (
                        <div className="p-4 bg-white border-t border-slate-50 flex justify-center">
                            <button
                                onClick={onLoadMore}
                                disabled={isLoadingMore} // Deshabilitar si está cargando
                                className="text-xs text-gray-400 hover:text-emerald-700 flex items-center gap-1 transition-colors font-medium disabled:opacity-50"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                        Cargando...
                                    </>
                                ) : (
                                    <>
                                        Ver más <ChevronDown size={12} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                // Empty State
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <FileText className="text-slate-300" size={30} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">No se encontraron resultados</h3>
                    <p className="text-gray-400 text-sm max-w-sm">
                        Intenta ajustar los términos de búsqueda.
                    </p>
                </div>
            )
            }
        </div >
    );
}