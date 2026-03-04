import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import Loading from '../../../components/Loading';
import { listarcierres } from '../../../services/documentacionService';
import { Search, Eye, ChevronDown } from 'lucide-react'; // Agregué ChevronDown
import ModalDetalleExpediente from '../../../components/documentacion/DetalleExpediente';

export default function DocumentacionPage() {
    const [cierres, setCierres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [cierreSeleccionado, setCierreSeleccionado] = useState(null);

    // --- ESTADOS DE PAGINACIÓN ---
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

            // Llamamos al servicio pasando la página
            const res = await listarcierres(pageToLoad);
            const data = res.data;
            const contenido = data?.contenido || data || [];

            if (pageToLoad === 0) {
                setCierres(contenido);
            } else {
                // Concatenamos las nuevas páginas
                setCierres(prev => [...prev, ...contenido]);
            }

            // Validamos si hay más páginas
            if (data.ultima !== undefined) {
                setHasMore(!data.ultima);
            } else {
                setHasMore(contenido.length > 0);
            }

        } catch (error) {
            console.error("Error cargando documentación:", error);
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

    const formatDateLocal = (dateString) => {
        if (!dateString) return 'N/A';
        const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString();
    };

    // --- LÓGICA DE FILTRADO ---
    const filteredData = cierres.filter((c) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        
        const idCierre = c.idCierre?.toString() || "";
        const proveedor = c.evaluacionEntrega?.compra?.aprobacionPresupuesto?.presupuesto?.proveedor?.nombreEmpresa?.toLowerCase() || "";
        
        // 1. Formateamos la fecha a texto (ej: "25/2/2026") para poder buscar en ella
        const fecha = formatDateLocal(c.fechaCierre).toLowerCase();
        
        // 2. Agregamos 'fecha' a la condición de retorno
        return idCierre.includes(term) || proveedor.includes(term) || fecha.includes(term);
    });

    return (
        <Layout>
            <div className="animate-in fade-in duration-300">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900">Documentación y Expedientes</h1>
                    <p className="text-sm text-gray-500">Consulte y descargue los expedientes de compras finalizadas.</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-base font-bold text-slate-800">Expedientes Archivados</h2>
                        <div className="relative w-full sm:w-64 ml-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar por ID, proveedor o fecha (ej: 2026, 25/02)..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : filteredData.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            No se encontraron expedientes cerrados.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">ID Expediente</th>
                                        <th className="px-6 py-4">Proveedor</th>
                                        <th className="px-6 py-4">Fecha de Cierre</th>
                                        <th className="px-6 py-4 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredData.map((c) => (
                                        <tr key={c.idCierre} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-700">
                                                #{c.idCierre}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-800">
                                                {c.evaluacionEntrega?.compra?.aprobacionPresupuesto?.presupuesto?.proveedor?.nombreEmpresa}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {formatDateLocal(c.fechaCierre)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setCierreSeleccionado(c)}
                                                    className="inline-flex items-center gap-1 text-[#1C5B5A] font-bold text-xs hover:underline"
                                                >
                                                    <Eye size={14} /> Ver Expediente
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {/* --- BOTÓN VER MÁS AGREGADO --- */}
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
                                            <>
                                                Ver más <ChevronDown size={12} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>

            {cierreSeleccionado && (
                <ModalDetalleExpediente
                    cierre={cierreSeleccionado}
                    onClose={() => setCierreSeleccionado(null)}
                />
            )}
        </Layout>
    );
}