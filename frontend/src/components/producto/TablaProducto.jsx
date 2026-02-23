import React, { useState } from 'react';
import { Search, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function TablaProducto({
    productos,
    onEdit,
    onDeactivate,
    onLoadMore,
    hasMore,
    isLoadingMore
}) {
    const [searchTerm, setSearchTerm] = useState("");

    const getEstadoBadge = (activo) => {
        return activo ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-max border border-emerald-100 uppercase">
                <CheckCircle size={10} /> Activo
            </span>
        ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded w-max border border-slate-200 uppercase">
                <XCircle size={10} /> Inactivo
            </span>
        );
    };

    // Filtro por nombre de producto
    const filteredData = productos.filter((p) => {
        const term = searchTerm.toLowerCase();
        return p.nombre?.toLowerCase().includes(term);
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-base font-bold text-slate-800">Catálogo de Productos</h2>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
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
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">NOMBRE DEL PRODUCTO</th>
                            <th className="px-6 py-4">ESTADO</th>
                            <th className="px-6 py-4 text-right">ACCIONES</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50">
                        {filteredData.map((p) => (
                            <tr key={p.idProducto} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                                    #{p.idProducto}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800 text-sm">{p.nombre}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getEstadoBadge(p.activo)}
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button
                                        onClick={() => onEdit(p)}
                                        className="inline-flex items-center gap-1 text-blue-600 font-bold text-xs hover:underline cursor-pointer"
                                    >
                                        <Pencil size={14} /> Editar
                                    </button>

                                    {p.activo && (
                                        <button
                                            onClick={() => onDeactivate(p.idProducto)}
                                            className="inline-flex items-center gap-1 text-red-600 font-bold text-xs hover:underline cursor-pointer"
                                        >
                                            <Trash2 size={14} /> Baja
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredData.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No se encontraron productos que coincidan con la búsqueda.
                    </div>
                )}

                {hasMore && filteredData.length > 0 && (
                    <div className="p-4 bg-white border-t border-slate-50 flex justify-center">
                        <button
                            onClick={onLoadMore}
                            disabled={isLoadingMore}
                            className="text-xs text-gray-400 hover:text-emerald-700 flex items-center gap-1 transition-colors font-medium disabled:opacity-50"
                        >
                            {isLoadingMore ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                    Cargando...
                                </>
                            ) : (
                                "Ver más"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}