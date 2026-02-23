import React, { useEffect, useState } from 'react';
import { listarAprobacionesPorEstado } from '../../services/presupuestoService';
import { FileText, ChevronRight, Search, ChevronDown } from 'lucide-react'; // Agregamos ChevronDown
import Loading from '../Loading';

export default function SeleccionSolicitud({ onSelect }) {
    const [aprobaciones, setAprobaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // --- ESTADOS DE PAGINACIÓN ---
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        cargarDatos(0);
    }, []);

    const cargarDatos = async (pageToLoad = 0) => {
        try {
            if (pageToLoad === 0) {
                setLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            // Pasamos la página al servicio
            const res = await listarAprobacionesPorEstado(pageToLoad);
            const data = res.data;
            const contenido = data?.contenido || data || [];

            if (pageToLoad === 0) {
                setAprobaciones(contenido);
            } else {
                // Si es cargar más, concatenamos
                setAprobaciones(prev => [...prev, ...contenido]);
            }

            // Determinar si quedan más páginas (asumiendo estructura Spring Page<T>)
            if (data.ultima !== undefined) {
                setHasMore(!data.ultima);
            } else {
                // Fallback por si el backend devuelve array directo
                setHasMore(contenido.length > 0);
            }

        } catch (error) {
            console.error("Error cargando aprobaciones:", error);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        cargarDatos(nextPage);
    };

    // --- LÓGICA DE FILTRADO (Aplica sobre lo cargado) ---
    const filteredData = aprobaciones.filter((item) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();

        const idAprob = item.id?.toString() || "";
        const producto = item.solicitud?.producto?.nombre?.toLowerCase() || "";
        const solicitante = item.solicitud?.usuario?.username?.toLowerCase() || "";
        const fecha = item.fecha ? new Date(item.fecha).toLocaleDateString() : "";

        return (
            idAprob.includes(term) ||
            producto.includes(term) ||
            solicitante.includes(term) ||
            fecha.includes(term)
        );
    });

    if (loading) return <Loading />;

    if (aprobaciones.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-lg border border-slate-100">
                <FileText className="mx-auto text-slate-300 mb-2" size={40} />
                <h3 className="text-slate-600 font-medium">No hay solicitudes aprobadas pendientes</h3>
                <p className="text-sm text-gray-400">Todo está al día.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">

            {/* --- HEADER CON BUSCADOR --- */}
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-base font-bold text-slate-800">Seleccione una solicitud</h2>

                <div className="relative w-full sm:w-64 ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por ID, producto..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* --- TABLA --- */}
            {filteredData.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">ID Aprob.</th>
                                <th className="px-6 py-4">Fecha Aprob.</th>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Solicitante</th>
                                <th className="px-6 py-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">#{item.id}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(item.fecha).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-800">{item.solicitud?.producto?.nombre}</div>
                                        <div className="text-xs text-gray-400">{item.solicitud?.cantidad} unidades</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {item.solicitud?.usuario?.username}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onSelect(item)}
                                            className="text-emerald-700 font-bold hover:underline flex items-center justify-end gap-1 ml-auto"
                                        >
                                            Gestionar <ChevronRight size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* --- BOTÓN VER MÁS --- */}
                    {hasMore && (
                        <div className="p-4 bg-white border-t border-slate-50 flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
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
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="text-slate-300" size={30} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">No se encontraron resultados</h3>
                    <p className="text-gray-400 text-sm">Intenta con otro término de búsqueda.</p>
                </div>
            )}
        </div>
    );
}