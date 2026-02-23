import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import SeleccionPresupuesto from '../../../components/compra/SeleccionPresupuesto';
import GestionCompra from '../../../components/compra/GestionCompra';

export default function ComprasPage() {
    const [aprobacionSeleccionada, setAprobacionSeleccionada] = useState(null);

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