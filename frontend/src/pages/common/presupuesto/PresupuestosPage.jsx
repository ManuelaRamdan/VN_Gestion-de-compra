import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import SeleccionSolicitud from '../../../components/presupuesto/SeleccionSolicitud';
import GestionPresupuestos from '../../../components/presupuesto/GestionPresupuestos';
import { useAuth } from '../../../context/AuthContext';

export default function PresupuestosPage() {
    const { user } = useAuth();
    const permisos = user?.permisos || [];
    const puedeGestionar = permisos.includes('PERM_PRESUPUESTOS_GESTIONAR');

    const [aprobacionSeleccionada, setAprobacionSeleccionada] = useState(null);

    return (
        <Layout>
            <div className="animate-in fade-in duration-300">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900">
                        {aprobacionSeleccionada ? "Detalle de Presupuestos" : "Presupuestos"}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {aprobacionSeleccionada 
                            ? "Consulte o gestione las cotizaciones de esta solicitud." 
                            : "Seleccione una solicitud aprobada de la lista."}
                    </p>
                </div>

                {!aprobacionSeleccionada ? (
                    <SeleccionSolicitud 
                        onSelect={(aprob) => setAprobacionSeleccionada(aprob)} 
                        puedeGestionar={puedeGestionar}
                    />
                ) : (
                    <GestionPresupuestos
                        aprobacion={aprobacionSeleccionada}
                        onBack={() => setAprobacionSeleccionada(null)}
                        puedeGestionar={puedeGestionar}
                    />
                )}
            </div>
        </Layout>
    );
}