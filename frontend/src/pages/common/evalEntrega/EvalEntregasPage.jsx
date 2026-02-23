import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import SeleccionCompra from '../../../components/evalEntraga/SeleccionCompra';
import GestionEntrega from '../../../components/evalEntraga/GestionEntrega';

export default function EvalEntregasPage() {
    const [compraSeleccionada, setCompraSeleccionadaa] = useState(null);

    return (
        <Layout>
            <div className="animate-in fade-in duration-300">
                {!compraSeleccionada ? (
                    <>
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-slate-900">Gestión de evaluación de entrega</h1>
                            <p className="text-sm text-gray-500">Seleccione una compra para registrar la evaluación.</p>
                        </div>
                        <SeleccionCompra onSelect={(aprob) => setCompraSeleccionadaa(aprob)} />
                    </>
                ) : (
                    <GestionEntrega 
                        compra={compraSeleccionada} 
                        onBack={() => setCompraSeleccionadaa(null)} 
                    />
                )}
            </div>
        </Layout>
    );
}