import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import SeleccionPresupuesto from '../../../components/compra/SeleccionPresupuesto';
import GestionCompra from '../../../components/compra/GestionCompra';
import ListaComprasSoloLectura from '../../../components/compra/ListaComprasSoloLectura';
import { useAuth } from '../../../context/AuthContext';

export default function ComprasPage() {
    const { user } = useAuth();
    const permisos = user?.permisos || [];
    const puedeGestionar = permisos.includes('PERM_COMPRAS_GESTIONAR');

    const [aprobacionSeleccionada, setAprobacionSeleccionada] = useState(null);

    if (!puedeGestionar) {
        return (
            <Layout>
                <div className="animate-in fade-in duration-300">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-slate-900">Compras</h1>
                        <p className="text-sm text-gray-500">Consulte las compras registradas y sus detalles.</p>
                    </div>
                    <ListaComprasSoloLectura />
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
                            <h1 className="text-xl font-bold text-slate-900">Gestión de Compras</h1>
                            <p className="text-sm text-gray-500">Seleccione un presupuesto aprobado para gestionar su compra.</p>
                        </div>
                        <SeleccionPresupuesto onSelect={(aprob) => setAprobacionSeleccionada(aprob)} />
                    </>
                ) : (
                    <GestionCompra
                        aprobacion={aprobacionSeleccionada}
                        onBack={() => setAprobacionSeleccionada(null)}
                    />
                )}
            </div>
        </Layout>
    );
}