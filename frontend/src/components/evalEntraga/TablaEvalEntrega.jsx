import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function TablaEvalEntrega({ evaluaciones, onViewDetails }) {
    const [searchTerm, setSearchTerm] = useState("");

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const getCumpleBadge = (cumple) => {
        return cumple ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase">
                <CheckCircle size={10} /> Cumple
            </span>
        ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-200 uppercase">
                <XCircle size={10} /> No cumple
            </span>
        );
    };

    const filteredData = evaluaciones.filter((e) => {
        const term = searchTerm.toLowerCase();
        const p = e.compra?.aprobacionPresupuesto?.presupuesto;
        return (
            p?.proveedor?.nombreEmpresa?.toLowerCase().includes(term) ||
            p?.aprobacionSolicitud?.solicitud?.producto?.nombre?.toLowerCase().includes(term) ||
            e.idEvaluacionEntrega?.toString().includes(term)
        );
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-base font-bold text-slate-800">Evaluaciones de Entrega</h2>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar proveedor o producto..."
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
                            <th className="px-6 py-4">ID / FECHA ENTREGA</th>
                            <th className="px-6 py-4">PROVEEDOR</th>
                            <th className="px-6 py-4">PRODUCTO</th>
                            <th className="px-6 py-4">RESULTADO</th>
                            <th className="px-6 py-4 text-right">ACCIÓN</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredData.map((e) => {
                            const p = e.compra?.aprobacionPresupuesto?.presupuesto;
                            return (
                                <tr key={e.idEvaluacionEntrega} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-800">#EVAL-{e.idEvaluacionEntrega}</div>
                                        <div className="text-[11px] text-gray-400">{formatDate(e.fechaEntrega)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 text-sm">{p?.proveedor?.nombreEmpresa}</div>
                                        <div className="text-[11px] text-gray-400">{p?.proveedor?.mail}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-700">{p?.aprobacionSolicitud?.solicitud?.producto?.nombre}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getCumpleBadge(e.cumpleCondiciones)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onViewDetails(e)}
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