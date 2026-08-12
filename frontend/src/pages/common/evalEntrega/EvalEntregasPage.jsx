import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import SeleccionCompra from '../../../components/evalEntraga/SeleccionCompra';
import GestionEntrega from '../../../components/evalEntraga/GestionEntrega';
import ListaEvalEntregaSoloLectura from '../../../components/evalEntraga/ListaEvalEntregaSoloLectura';
import { useAuth } from '../../../context/AuthContext';

export default function EvalEntregasPage() {
    const { user } = useAuth();
    const permisos = user?.permisos || [];
    const puedeEditar = permisos.includes('PERM_EVAL_ENTREGA_EDITAR');

    const [compraSeleccionada, setCompraSeleccionadaa] = useState(null);

    if (!puedeEditar) {
        return (
            <Layout>
                <div className="animate-in fade-in duration-300">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-slate-900">Evaluaciones de Entrega</h1>
                        <p className="text-sm text-gray-500">Consulte las evaluaciones registradas.</p>
                    </div>
                    <ListaEvalEntregaSoloLectura />
                </div>
            </Layout>
        );
    }

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