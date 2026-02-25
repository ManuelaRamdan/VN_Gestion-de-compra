import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import Loading from '../../../components/Loading';
import { listarcierres } from '../../../services/documentacionService';
import { Search, Eye, Archive } from 'lucide-react';
import ModalDetalleExpediente from '../../../components/documentacion/DetalleExpediente';

export default function DocumentacionPage() {
    const [cierres, setCierres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [cierreSeleccionado, setCierreSeleccionado] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const res = await listarcierres();
            const data = res.data?.contenido || res.data || [];
            setCierres(data);
        } catch (error) {
            console.error("Error cargando documentación:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateLocal = (dateString) => {
        if (!dateString) return 'N/A';
        const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString();
    };

    const filteredData = cierres.filter(c => {
        const prod = c.evaluacionEntrega?.compra?.aprobacionPresupuesto?.presupuesto?.aprobacionSolicitud?.solicitud?.producto?.nombre || "";
        const prov = c.evaluacionEntrega?.compra?.aprobacionPresupuesto?.presupuesto?.proveedor?.nombreEmpresa || "";
        const term = searchTerm.toLowerCase();

        return (
            c.idCierre?.toString().includes(term) ||
            prod.toLowerCase().includes(term) ||
            prov.toLowerCase().includes(term)
        );
    });

    return (
        <Layout>
            <div className="animate-in fade-in duration-300">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Archive className="text-emerald-700" size={24} />
                        Documentación y Archivo
                    </h1>
                    <p className="text-sm text-gray-500">Historial de expedientes finalizados.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-50 flex justify-end bg-slate-50/30">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar por ID o Producto..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? <div className="p-20"><Loading /></div> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#F8F9FC] text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">ID CIERRE</th>
                                        <th className="px-6 py-4">PRODUCTO</th>
                                        <th className="px-6 py-4">PROVEEDOR</th>
                                        <th className="px-6 py-4">FECHA CIERRE</th>
                                        <th className="px-6 py-4 text-right">ACCIÓN</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredData.map((c) => (
                                        <tr key={c.idCierre} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-700">#CIE-{c.idCierre}</td>
                                            <td className="px-6 py-4 font-medium text-slate-800">
                                                {c.evaluacionEntrega?.compra?.aprobacionPresupuesto?.presupuesto?.aprobacionSolicitud?.solicitud?.producto?.nombre}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
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