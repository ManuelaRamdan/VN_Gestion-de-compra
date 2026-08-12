import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import SeleccionSolicitud from '../../../components/presupuesto/SeleccionSolicitud';
import GestionPresupuestos from '../../../components/presupuesto/GestionPresupuestos';
import ListaPresupuestosSoloLectura from '../../../components/presupuesto/ListaPresupuestosSoloLectura.jsx';
import { useAuth } from '../../../context/AuthContext';

export default function PresupuestosPage() {
    const { user } = useAuth();
    const permisos = user?.permisos || [];
    const puedeGestionar = permisos.includes('PERM_PRESUPUESTOS_GESTIONAR');

    const [aprobacionSeleccionada, setAprobacionSeleccionada] = useState(null);

    if (!puedeGestionar) {
        return (
            <Layout>
                <div className="animate-in fade-in duration-300">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-slate-900">Presupuestos</h1>
                        <p className="text-sm text-gray-500">Consulte los presupuestos cargados y sus detalles.</p>
                    </div>
                    <ListaPresupuestosSoloLectura />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="animate-in fade-in duration-300">
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