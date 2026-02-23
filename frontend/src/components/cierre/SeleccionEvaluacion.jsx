// src/components/cierre/SeleccionEvaluacion.jsx
import React, { useEffect, useState } from 'react';
import { listarEvaluaciones } from '../../services/evalEntregaService'; // Asegúrate que esta ruta sea correcta
import { Archive, ChevronRight, Search, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react';
import Loading from '../Loading';

export default function SeleccionEvaluacion({ onSelect }) {
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        cargarDatos(0);
    }, []);

    const cargarDatos = async (pageToLoad = 0) => {
        try {
            if (pageToLoad === 0) setLoading(true);
            else setIsLoadingMore(true);

            // Asumiendo que listarEvaluaciones soporta paginación
            const res = await listarEvaluaciones(pageToLoad);
            const data = res.data;
            const contenido = data?.contenido || data || [];

            if (pageToLoad === 0) {
                setEvaluaciones(contenido);
            } else {
                setEvaluaciones(prev => [...prev, ...contenido]);
            }

            if (data.ultima !== undefined) setHasMore(!data.ultima);
            else setHasMore(contenido.length > 0);

        } catch (error) {
            console.error("Error cargando evaluaciones:", error);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    const filteredData = evaluaciones.filter((item) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const idEval = item.idEvaluacionEntrega?.toString() || "";
        const producto = item.compra?.aprobacionPresupuesto?.presupuesto?.aprobacionSolicitud?.solicitud?.producto?.nombre?.toLowerCase() || "";
        return idEval.includes(term) || producto.includes(term);
    });

    if (loading) return <Loading />;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-base font-bold text-slate-800">Evaluaciones Pendientes de Cierre</h2>
                <div className="relative w-full sm:w-64 ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por ID, producto..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">ID Eval.</th>
                            <th className="px-6 py-4">Producto (Compra)</th>
                            <th className="px-6 py-4">Estado Entrega</th>
                            <th className="px-6 py-4 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredData.map((item) => (
                            <tr key={item.idEvaluacionEntrega} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-700">#{item.idEvaluacionEntrega}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">
                                        {item.compra?.aprobacionPresupuesto?.presupuesto?.aprobacionSolicitud?.solicitud?.producto?.nombre}
                                    </div>
                                    <div className="text-xs text-gray-400">Compra #{item.compra?.idCompra}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {item.cumpleCondiciones ? (
                                        <span className="flex items-center gap-1 text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-1 rounded w-max">
                                            <CheckCircle size={14}/> Conforme
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-600 font-medium text-xs bg-red-50 px-2 py-1 rounded w-max">
                                            <AlertTriangle size={14}/> No Conforme
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => onSelect(item)} className="text-emerald-700 font-bold hover:underline flex items-center justify-end gap-1 ml-auto">
                                        Gestionar Cierre <ChevronRight size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}