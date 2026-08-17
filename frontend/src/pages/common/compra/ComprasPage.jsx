import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import SeleccionPresupuesto from '../../../components/compra/SeleccionPresupuesto';
import GestionCompra from '../../../components/compra/GestionCompra';
import { useAuth } from '../../../context/AuthContext';

export default function ComprasPage() {
    const { user } = useAuth();
    const permisos = user?.permisos || [];
    const puedeGestionar = permisos.includes('PERM_COMPRAS_GESTIONAR');

    const [aprobacionSeleccionada, setAprobacionSeleccionada] = useState(null);

    return (
        <Layout>
            <div className="animate-in fade-in duration-300">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900">
                        {aprobacionSeleccionada ? "Detalle de Compra" : "Gestión de Compras"}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {aprobacionSeleccionada 
                            ? "Consulte o gestione la compra de este expediente." 
                            : "Seleccione un presupuesto aprobado de la lista."}
                    </p>
                </div>

                {!aprobacionSeleccionada ? (
                    <SeleccionPresupuesto 
                        onSelect={(aprob) => setAprobacionSeleccionada(aprob)} 
                        puedeGestionar={puedeGestionar}
                    />
                ) : (
                    <GestionCompra
                        aprobacion={aprobacionSeleccionada}
                        onBack={() => setAprobacionSeleccionada(null)}
                        puedeGestionar={puedeGestionar}
                    />
                )}
            </div>
        </Layout>
    );
}