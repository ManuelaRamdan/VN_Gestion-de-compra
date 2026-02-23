import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

// Importa tus VISTAS específicas
import SolicitudPanel from './solicitud/SolicitudPanel';

export default function SolicitudesWrapper() {
    const { user } = useAuth();

    // Debug: ver qué usuario llega
    console.log("Wrapper - Usuario:", user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }



    // 2. Si es CALIDAD o GERENCIA, le mostramos la vista de Aprobación/Selección
    if (user.rol === 'CALIDAD' || user.rol === 'GERENCIA' || user.rol === 'ADMINISTRACION') {
        // NOTA: Si aún no creaste SolicitudesPage, usa AdminPanel temporalmente para probar
        // return <AdminPanel />; 
        return <SolicitudPanel />;
    }

    // 3. Fallback por seguridad
    return <Navigate to="/login" />;
}