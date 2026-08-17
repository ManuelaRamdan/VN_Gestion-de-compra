import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import SeleccionCompra from '../../../components/evalEntraga/SeleccionCompra';
import GestionEntrega from '../../../components/evalEntraga/GestionEntrega';
import { useAuth } from '../../../context/AuthContext';

export default function EvalEntregasPage() {
    const { user } = useAuth();
    const permisos = user?.permisos || [];
    const puedeEditar = permisos.includes('PERM_EVAL_ENTREGA_EDITAR');

    const [compraSeleccionada, setCompraSeleccionadaa] = useState(null);

    return (
        <Layout>
            <div className="animate-in fade-in duration-300">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900">
                        {compraSeleccionada ? "Detalle de Evaluación de Entrega" : "Evaluaciones de Entrega"}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {compraSeleccionada 
                            ? "Consulte o gestione la evaluación de esta entrega." 
                            : "Seleccione una compra de la lista para ver su evaluación."}
                    </p>
                </div>

                {!compraSeleccionada ? (
                    <SeleccionCompra 
                        onSelect={(aprob) => setCompraSeleccionadaa(aprob)} 
                        puedeEditar={puedeEditar}
                    />
                ) : (
                    <GestionEntrega
                        compra={compraSeleccionada}
                        onBack={() => setCompraSeleccionadaa(null)}
                        puedeEditar={puedeEditar}
                    />
                )}
            </div>
        </Layout>
    );
}