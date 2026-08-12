import React, { useEffect, useState } from 'react';
import { listarTodasLasCompras } from '../../services/compraService';
import TablaCompra from './TablaCompra';
import DetalleCompra from './DetalleCompra';
import Loading from '../Loading';

export default function ListaComprasSoloLectura() {
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [seleccionada, setSeleccionada] = useState(null);

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true);
                const res = await listarTodasLasCompras();
                const data = res.data?.contenido || res.data || [];
                setCompras(data);
            } catch (err) {
                setError('No se pudieron cargar las compras.');
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    if (loading) return <Loading />;
    if (error) return <div className="text-center py-10 text-red-500 text-sm">{error}</div>;

    return (
        <>
            <TablaCompra compras={compras} onViewDetails={(item) => setSeleccionada(item)} />
            {seleccionada && (
                <DetalleCompra compra={seleccionada} onClose={() => setSeleccionada(null)} />
            )}
        </>
    );
}