import React, { useState } from 'react';
import { Search, Eye, Archive } from 'lucide-react';

export default function TablaCierre({ cierres, onViewDetails }) {
    const [searchTerm, setSearchTerm] = useState("");

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filteredData = cierres.filter((c) => {
        const term = searchTerm.toLowerCase();
        const producto = c.evaluacionEntrega?.compra?.aprobacionPresupuesto?.presupuesto?.aprobacionSolicitud?.solicitud?.producto?.nombre?.toLowerCase() || "";
        return producto.includes(term) || c.idCierre?.toString().includes(term);
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-base font-bold text-slate-800">Expedientes Cerrados</h2>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por producto..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#F8F9FC] text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <th className="px-6 py-4">ID / FECHA CIERRE</th>
                            <th className="px-6 py-4">PRODUCTO</th>
                            <th className="px-6 py-4">CERRADO POR</th>
                            <th className="px-6 py-4 text-right">ACCIÓN</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredData.map((c) => {
                            const solicitud = c.evaluacionEntrega?.compra?.aprobacionPresupuesto?.presupuesto?.aprobacionSolicitud?.solicitud;
                            return (
                                <tr key={c.idCierre} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-800 flex items-center gap-1">
                                            <Archive size={12} className="text-slate-400" /> #CIE-{c.idCierre}
                                        </div>
                                        <div className="text-[11px] text-gray-400">{formatDate(c.fechaCierre)}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{solicitud?.producto?.nombre}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{c.usuario?.username}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onViewDetails(c)}
                                            className="inline-flex items-center gap-1 text-[#1C5B5A] font-bold text-xs hover:underline cursor-pointer"
                                        >
                                            <Eye size={14} /> Detalles
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}