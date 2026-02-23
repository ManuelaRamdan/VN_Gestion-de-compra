import React, { useState } from 'react';
import { Search, ChevronDown, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function TablaPresupuesto({ presupuestos, onViewDetails }) {
    const [searchTerm, setSearchTerm] = useState("");

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('es-ES', { 
            month: 'short', day: 'numeric', year: 'numeric' 
        });
    };

    const getSatisfactionBadge = (isSatisfactory) => {
        return isSatisfactory ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase">
                <CheckCircle size={10} /> Satisfactorio
            </span>
        ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200 uppercase">
                <XCircle size={10} /> Normal
            </span>
        );
    };

    // Lógica de filtrado
    const filteredData = presupuestos.filter((item) => {
        const term = searchTerm.toLowerCase();
        // El item suele ser un AprobacionPresupuesto que contiene al presupuesto
        const p = item.presupuesto || item; 
        return (
            p.proveedor?.nombreEmpresa?.toLowerCase().includes(term) ||
            p.aprobacionSolicitud?.solicitud?.producto?.nombre?.toLowerCase().includes(term) ||
            p.idPresupuesto?.toString().includes(term)
        );
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-base font-bold text-slate-800">Presupuestos Disponibles</h2>
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
                            <th className="px-6 py-4">ID / FECHA RECEPCION</th>
                            <th className="px-6 py-4">PROVEEDOR</th>
                            <th className="px-6 py-4">PRODUCTO SOLICITADO</th>
                            <th className="px-6 py-4">COTIZACIÓN</th>
                            <th className="px-6 py-4 text-right">ACCION</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredData.map((item) => {
                            const p = item.presupuesto || item;
                            return (
                                <tr key={p.idPresupuesto} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-800">#PRP-{p.idPresupuesto}</div>
                                        <div className="text-[11px] text-gray-400">{formatDate(p.fechaRecepcion)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 text-sm">{p.proveedor?.nombreEmpresa}</div>
                                        <div className="text-[11px] text-gray-400">{p.proveedor?.mail}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-700">{p.aprobacionSolicitud?.solicitud?.producto?.nombre}</div>
                                        <div className="text-[11px] text-gray-400">{p.aprobacionSolicitud?.solicitud?.cantidad} unidades</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getSatisfactionBadge(p.cotizacionSatisfactoria)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onViewDetails(item)}
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