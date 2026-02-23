import React, { useState } from 'react';
import { X, Download, Package, FileSearch, ShoppingCart, Truck, Archive } from 'lucide-react';
import { descargarExpedientePdf } from '../../services/documentacionService';

export default function DetalleExpediente({ cierre, onClose }) {
    const [isDownloading, setIsDownloading] = useState(false);
    
    // Acceso simplificado mediante encadenamiento opcional
    const ev = cierre.evaluacionEntrega;
    const co = ev?.compra;
    const pr = co?.aprobacionPresupuesto?.presupuesto;
    const so = pr?.aprobacionSolicitud?.solicitud;

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            // Usamos el idCierre para el PDF y el idSolicitud para el nombre del archivo
            await descargarExpedientePdf(cierre.idCierre, so?.idSolicitud);
        } catch (error) {
            alert("Error al generar el documento.");
        } finally {
            setIsDownloading(false);
        }
    };

    const Step = ({ icon: Icon, title, desc, date }) => (
        <div className="flex gap-4 relative pb-8 last:pb-0">
            <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-200 last:hidden"></div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 bg-emerald-100 text-emerald-600">
                <Icon size={16} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-slate-800">{title}</h4>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {date ? new Date(date).toLocaleDateString() : 'N/A'}
                    </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="bg-[#1C5B5A] px-6 py-4 flex justify-between items-center text-white">
                    <div>
                        <h3 className="font-bold text-lg">Historial del Expediente</h3>
                        <p className="text-xs opacity-80">Solicitud #{so?.idSolicitud} • {so?.producto?.nombre}</p>
                    </div>
                    <button onClick={onClose}><X size={20} className="hover:opacity-75" /></button>
                </div>

                <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1">
                    <div className="flex justify-end mb-6">
                        <button 
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50"
                        >
                            {isDownloading ? "Generando..." : <><Download size={18} /> Descargar PDF Completo</>}
                        </button>
                    </div>

                    <div className="space-y-2">
                        <Step 
                            icon={Package} 
                            title="1. Solicitud de Compra" 
                            date={so?.fecha}
                            desc={`Iniciada por ${so?.usuario?.username}. Cantidad: ${so?.cantidad} ${so?.producto?.nombre}.`}
                        />
                        <Step 
                            icon={FileSearch} 
                            title="2. Presupuesto Seleccionado" 
                            date={pr?.fechaRecepcion}
                            desc={`Proveedor: ${pr?.provider?.nombreEmpresa || pr?.proveedor?.nombreEmpresa}. Cotización validada como satisfactoria.`}
                        />
                        <Step 
                            icon={ShoppingCart} 
                            title="3. Compra y Facturación" 
                            date={co?.fechaRecepcion}
                            desc={`Factura registrada por ${co?.usuario?.username}.`}
                        />
                        <Step 
                            icon={Truck} 
                            title="4. Evaluación de Entrega" 
                            date={ev?.fechaEntrega}
                            desc={ev?.observaciones || "Sin observaciones en la entrega."}
                        />
                        <Step 
                            icon={Archive} 
                            title="5. Cierre Administrativo" 
                            date={cierre?.fechaCierre}
                            desc={cierre?.observaciones || "Expediente auditado y archivado correctamente."}
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}