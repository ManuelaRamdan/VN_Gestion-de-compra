import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import SeleccionEvaluacion from '../../../components/cierre/SeleccionEvaluacion';
import GestionCierre from '../../../components/cierre/GestionCierre';
import { useAuth } from '../../../context/AuthContext';

export default function CierresPage() {
    const { user } = useAuth();
    const permisos = user?.permisos || [];
    
    // 1. Extraemos todos los permisos necesarios
    const puedeGestionar = permisos.includes('PERM_CIERRES_GESTIONAR');
    const puedeVerEvalProv = permisos.includes('PERM_EVAL_PROVEEDOR_VER') || permisos.includes('PERM_EVAL_PROVEEDOR_EDITAR');
    const puedeEditarEvalProv = permisos.includes('PERM_EVAL_PROVEEDOR_EDITAR');
    const puedeVerReclamos = permisos.includes('PERM_RECLAMOS'); // O el permiso exacto que uses para reclamos

    const location = useLocation();
    const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(
        location.state?.evaluacionPreseleccionada || null
    );

    useEffect(() => {
        if (location.state?.evaluacionPreseleccionada) {
            window.history.replaceState({}, document.title);
        }
    }, []);

    return (
        <Layout>
            <div className="animate-in fade-in duration-300">
                {!evaluacionSeleccionada ? (
                    <>
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-slate-900">
                                {puedeGestionar ? "Cierre Administrativo" : "Pendientes de Cierre"}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {puedeGestionar 
                                    ? "Seleccione una evaluación de entrega para finalizar el proceso de compra."
                                    : "Consulte las evaluaciones que están pendientes de cierre."}
                            </p>
                        </div>
                        <SeleccionEvaluacion 
                            onSelect={(ev) => setEvaluacionSeleccionada(ev)} 
                            puedeGestionar={puedeGestionar} 
                        />
                    </>
                ) : (
                    <GestionCierre
                        evaluacion={evaluacionSeleccionada}
                        onBack={() => setEvaluacionSeleccionada(null)}
                        puedeGestionar={puedeGestionar}
                        // 2. Pasamos los permisos al hijo
                        puedeVerEvalProv={puedeVerEvalProv}
                        puedeEditarEvalProv={puedeEditarEvalProv}
                        puedeVerReclamos={puedeVerReclamos}
                    />
                )}
            </div>
        </Layout>
    );
}