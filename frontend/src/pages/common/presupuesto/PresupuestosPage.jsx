import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import SeleccionSolicitud from '../../../components/presupuesto/SeleccionSolicitud';
import GestionPresupuestos from '../../../components/presupuesto/GestionPresupuestos';

export default function PresupuestosPage() {
    const [aprobacionSeleccionada, setAprobacionSeleccionada] = useState(null);

    return (
        <Layout>
            <div className="animate-in fade-in duration-300"> {/* <--- AGREGAR ESTO PARA SUAVIDAD */}

                {!aprobacionSeleccionada ? (
                    <>
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-slate-900">Solicitudes Aprobadas</h1>
                            <p className="text-sm text-gray-500">Seleccione una solicitud para gestionar sus cotizaciones.</p>


                        </div>
                        <SeleccionSolicitud onSelect={(aprob) => setAprobacionSeleccionada(aprob)} />
                    </>
                ) : (
                    <GestionPresupuestos
                        aprobacion={aprobacionSeleccionada}
                        onBack={() => setAprobacionSeleccionada(null)}
                    />
                )}

            </div>
        </Layout>
    );
}