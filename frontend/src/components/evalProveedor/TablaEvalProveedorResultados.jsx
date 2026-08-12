import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Eye, Download } from 'lucide-react';

export default function TablaEvalProveedorResultados({ evaluaciones, onViewDetails, onDescargar, puedeDescargar }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = evaluaciones.filter((e) => {
        const term = searchTerm.toLowerCase();
        return e.proveedor?.nombreEmpresa?.toLowerCase().includes(term);
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-base font-bold text-slate-800">Evaluaciones de Proveedor</h2>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por empresa..."
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
                            <th className="px-6 py-4">PROVEEDOR</th>
                            <th className="px-6 py-4">PERÍODO</th>
                            <th className="px-6 py-4">RESULTADO</th>
                            <th className="px-6 py-4">ESTADO</th>
                            <th className="px-6 py-4 text-right">ACCIÓN</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredData.map((e) => (
                            <tr key={e.idEvalProveedor} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800 text-sm">{e.proveedor?.nombreEmpresa}</div>
                                    <div className="text-[11px] text-gray-400">{e.servicioProducto}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{e.periodoEvaluado}</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                    {e.resultado != null ? `${e.resultado}%` : "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {e.aprobado ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase w-max">
                                            <CheckCircle size={10} /> Aprobado
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-200 uppercase w-max">
                                            <XCircle size={10} /> No aprobado
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                                    <button
                                        onClick={() => onViewDetails(e)}
                                        className="inline-flex items-center gap-1 text-[#1C5B5A] font-bold text-xs hover:underline cursor-pointer"
                                    >
                                        <Eye size={14} /> Detalles
                                    </button>
                                    {puedeDescargar && (
                                        <button
                                            onClick={() => onDescargar(e.idEvalProveedor)}
                                            className="inline-flex items-center gap-1 text-blue-600 font-bold text-xs hover:underline cursor-pointer"
                                        >
                                            <Download size={14} /> PDF
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}