import React, { useEffect, useState } from 'react';
import { ListarAprobPresupuestoAprobadas } from '../../services/compraService';
import { FileText, ChevronRight, Search, ChevronDown } from 'lucide-react'; // Agregamos ChevronDown
import Loading from '../Loading';

export default function SeleccionPresupuesto({ onSelect }) {
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

            // Llamamos al servicio con el número de página
            const res = await ListarAprobPresupuestoAprobadas(pageToLoad);
            const data = res.data;
            const contenido = data?.contenido || data || [];

            if (pageToLoad === 0) {
                setAprobaciones(contenido);
            } else {
                // Si es paginación, concatenamos al array existente
                setAprobaciones(prev => [...prev, ...contenido]);
            }

            // Verificamos si es la última página
            if (data.ultima !== undefined) {
                setHasMore(!data.ultima);
            } else {
                // Fallback por si el backend devuelve un array simple
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

    // --- LÓGICA DE FILTRADO ---
    const filteredData = aprobaciones.filter((item) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();

        const idAprob = item.id?.toString() || "";
        const proveedor = item.presupuesto?.proveedor?.nombreEmpresa?.toLowerCase() || "";
        const producto = item.presupuesto?.aprobacionSolicitud?.solicitud?.producto?.nombre?.toLowerCase() || "";
        const aprobador = item.usuario?.username?.toLowerCase() || "";

        return (
            idAprob.includes(term) ||
            proveedor.includes(term) ||
            producto.includes(term) ||
            aprobador.includes(term)
        );
    });

    if (loading) return <Loading />;

    if (aprobaciones.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-lg border border-slate-100">
                <FileText className="mx-auto text-slate-300 mb-2" size={40} />
                <h3 className="text-slate-600 font-medium">No hay presupuestos aprobados pendientes</h3>
                <p className="text-sm text-gray-400">Todo está al día.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            {/* --- HEADER CON BUSCADOR --- */}
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-base font-bold text-slate-800">Seleccione un presupuesto</h2>

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

            {/* --- TABLA --- */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">ID Aprob.</th>
                            <th className="px-6 py-4">Proveedor</th>
                            <th className="px-6 py-4">Producto Solicitado</th>
                            <th className="px-6 py-4">Aprobado Por</th>
                            <th className="px-6 py-4 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">#{item.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{item.presupuesto?.proveedor?.nombreEmpresa}</div>
                                        <div className="text-xs text-gray-400">{item.presupuesto?.proveedor?.mail}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-800">{item.presupuesto?.aprobacionSolicitud?.solicitud?.producto?.nombre}</div>
                                        <div className="text-[11px] text-gray-400">{item.presupuesto?.aprobacionSolicitud?.solicitud?.cantidad} unidades</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">
                                        {item.usuario?.username}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onSelect(item)}
                                            className="text-emerald-700 font-bold hover:underline flex items-center justify-end gap-1 ml-auto"
                                        >
                                            Iniciar Compra <ChevronRight size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                                    No se encontraron resultados para "{searchTerm}"
                                </td>
                            </tr>
                        )}
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
        </div>
    );
}