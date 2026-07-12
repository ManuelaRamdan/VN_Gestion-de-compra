import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import Loading from '../../../components/Loading';
import { listarcierres, descargarExpedientesPorPeriodo } from '../../../services/documentacionService';
import { Search, Eye, ChevronDown, Download, X, AlertCircle } from 'lucide-react';
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

    // --- ESTADO PARA EL MODAL DE DESCARGA ---
    const [showDescargaModal, setShowDescargaModal] = useState(false);

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
                
                {/* ENCABEZADO CON BOTÓN DE DESCARGA */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Documentación y Expedientes</h1>
                        <p className="text-sm text-gray-500">Consulte y descargue los expedientes de compras finalizadas.</p>
                    </div>
                    <button
                        onClick={() => setShowDescargaModal(true)}
                        className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#1C5B5A] text-white rounded-lg font-bold text-sm hover:bg-[#164a49] shadow-md transition-all"
                    >
                        <Download size={16} /> Descargar expedientes (ZIP)
                    </button>
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
                            
                            {/* --- BOTÓN VER MÁS --- */}
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

            {/* MODAL DE DETALLE DEL EXPEDIENTE */}
            {cierreSeleccionado && (
                <ModalDetalleExpediente
                    cierre={cierreSeleccionado}
                    onClose={() => setCierreSeleccionado(null)}
                />
            )}

            {/* MODAL DE DESCARGA ZIP */}
            {showDescargaModal && (
                <DescargaExpedientesModal onClose={() => setShowDescargaModal(false)} />
            )}
        </Layout>
    );
}

// =========================================================================
// COMPONENTE MODAL SECUNDARIO (Se queda en este mismo archivo, fuera del principal)
// =========================================================================

function DescargaExpedientesModal({ onClose }) {
    const [modo, setModo] = useState('anio'); 
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDescargar = async (e) => {
        e.preventDefault();
        setError('');

        if (modo === 'rango' && desde && hasta && desde > hasta) {
            setError('La fecha "desde" no puede ser posterior a "hasta".');
            return;
        }

        setLoading(true);
        try {
            if (modo === 'anio') {
                await descargarExpedientesPorPeriodo({ anio: Number(anio) });
            } else {
                await descargarExpedientesPorPeriodo({ desde, hasta });
            }
            onClose();
        } catch (err) {
            const errorMsg = err.response && err.response.data && err.response.data.error 
                ? err.response.data.error 
                : 'No se pudo descargar el archivo.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl animate-in zoom-in-95">
                <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-[#1C5B5A] text-white rounded-t-xl">
                    <h3 className="font-bold text-lg">Descargar expedientes por período</h3>
                    <button onClick={onClose}><X size={20} className="hover:text-emerald-200" /></button>
                </div>

                <form onSubmit={handleDescargar} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
                            <AlertCircle size={16} className="shrink-0" /> {error}
                        </div>
                    )}

                    <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setModo('anio')}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${
                                modo === 'anio' ? 'bg-white text-[#1C5B5A] shadow-sm' : 'text-slate-500'
                            }`}
                        >
                            Por año
                        </button>
                        <button
                            type="button"
                            onClick={() => setModo('rango')}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${
                                modo === 'rango' ? 'bg-white text-[#1C5B5A] shadow-sm' : 'text-slate-500'
                            }`}
                        >
                            Por rango de fechas
                        </button>
                    </div>

                    {modo === 'anio' ? (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                Período (año)
                            </label>
                            <input
                                type="number"
                                value={anio}
                                onChange={(e) => setAnio(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                required
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Desde</label>
                                <input
                                    type="date"
                                    value={desde}
                                    onChange={(e) => setDesde(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Hasta</label>
                                <input
                                    type="date"
                                    value={hasta}
                                    onChange={(e) => setHasta(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-gray-400">
                        Se descargará un archivo .zip que contendrá los PDF de todos los expedientes archivados en el rango indicado.
                    </p>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-[#1C5B5A] text-white rounded-lg text-sm font-bold hover:bg-[#164a49] shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Generando...' : <><Download size={16} /> Descargar ZIP</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}