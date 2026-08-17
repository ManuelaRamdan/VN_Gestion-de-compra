import React, { useEffect, useState } from 'react';
import { listarProveedores, verificarAlertaEventual } from '../../services/evalProveedorService'; 
import { FileText, ChevronRight, Search, ChevronDown, AlertCircle } from 'lucide-react'; 
import Loading from '../Loading';

export default function SeleccionProveedor({ onSelect, puedeEditar = true }) {
    const [proveedores, setProveedores] = useState([]);
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

            const res = await listarProveedores(pageToLoad);
            const data = res.data;
            const contenidoOriginal = data?.contenido || data || [];

            const contenidoConAlerta = await Promise.all(
                contenidoOriginal.map(async (prov) => {
                    try {
                        const resAlerta = await verificarAlertaEventual(prov.idProveedor);
                        return { ...prov, requiereAlerta: resAlerta.data.requiereAlerta };
                    } catch (error) {
                        return { ...prov, requiereAlerta: false };
                    }
                })
            );

            if (pageToLoad === 0) {
                setProveedores(contenidoConAlerta);
            } else {
                setProveedores(prev => [...prev, ...contenidoConAlerta]);
            }

            if (data.ultima !== undefined) {
                setHasMore(!data.ultima);
            } else {
                setHasMore(contenidoOriginal.length > 0);
            }
        } catch (error) {
            console.error("Error cargando proveedores:", error);
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

    const safeText = (text) => {
        return String(text || "")
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const filteredData = proveedores.filter((prov) => {
        if (!searchTerm) return true;
        const term = safeText(searchTerm);
        const id = safeText(prov.idProveedor);
        const empresa = safeText(prov.nombreEmpresa);
        const email = safeText(prov.email);
        const telefono = safeText(prov.telefono);

        return (
            id.includes(term) ||
            empresa.includes(term) ||
            email.includes(term) ||
            telefono.includes(term)
        );
    });

    if (loading) return <Loading />;

    if (proveedores.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-lg border border-slate-100">
                <FileText className="mx-auto text-slate-300 mb-2" size={40} />
                <h3 className="text-slate-600 font-medium">
                    No hay proveedores registrados
                </h3>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            
            <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-base font-bold text-slate-800">Seleccione un proveedor</h2>

                <div className="relative w-full sm:w-64 ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar empresa, email..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Empresa</th>
                            <th className="px-6 py-4">Contacto</th>
                            <th className="px-6 py-4 text-right">Acción</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50">
                        {filteredData.length > 0 ? (
                            filteredData.map((prov) => (
                                <tr key={prov.idProveedor} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">
                                        #{prov.idProveedor}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 flex items-center gap-2">
                                            {prov.nombreEmpresa}
                                            {prov.requiereAlerta && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase border border-amber-200" title="Proveedor eventual con gestión reciente sin evaluar">
                                                    <AlertCircle size={10} />
                                                    Requiere Evaluación
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-400">{prov.telefono || "-"}</div>
                                        <div className="text-xs text-slate-500">{prov.email || "-"}</div>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onSelect(prov)}
                                            className="text-emerald-700 font-bold hover:underline flex items-center justify-end gap-1 ml-auto"
                                        >
                                            {puedeEditar ? "Evaluar" : "Ver Detalles"} <ChevronRight size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                                    No se encontraron resultados para "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

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