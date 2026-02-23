import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import SeleccionProveedor from '../../../components/evalProveedor/SeleccionProveedor';
import GestionEvalProveedor from '../../../components/evalProveedor/GestionEvalProveedor';

export default function EvalProveedorPage() {
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

    return (
        <Layout>
            <div className="animate-in fade-in duration-300">
                {!proveedorSeleccionado ? (
                    <>
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-slate-900">Gestión de evaluación de Proveedor</h1>
                            <p className="text-sm text-gray-500">Seleccione un proveedor para registrar la evaluación.</p>
                        </div>
                        <SeleccionProveedor onSelect={(aprob) => setProveedorSeleccionado(aprob)} />
                    </>
                ) : (
                    <GestionEvalProveedor 
                        proveedor={proveedorSeleccionado} 
                        onBack={() => setProveedorSeleccionado(null)} 
                    />
                )}
            </div>
        </Layout>
    );
}