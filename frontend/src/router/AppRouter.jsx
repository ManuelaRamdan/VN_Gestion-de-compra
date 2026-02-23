import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/login';
import ProtectRoute from "./ProtectRoute";

// --- IMPORTACIONES DE PÁGINAS UNIFICADAS ---
import SolicitudesWrapper from "../pages/common/SolicitudesWrapper"; // El distribuidor inteligente
import PresupuestosPage from "../pages/common/presupuesto/PresupuestosPage";
import CompraPage from "../pages/common/compra/ComprasPage";
import EvalEntregasPage from "../pages/common/evalEntrega/EvalEntregasPage";
import EvalProveedorPage from "../pages/common/evalProveedor/EvalProveedorPage";
import CrearSolicitud from "../components/solicitud/CrearSolicitud";
import CrearUsuario from "../components/usuario/CrearUsuario";
import AprobSoliPage from "../pages/common/aprobacion/AprobSoliPage";
import AprobPresuPage from "../pages/common/aprobacion/AprobPresuPage";
import CierrePage from "../pages/common/cierre/CierresPage";
import DocPage from "../pages/common/documentacion/DocumentacionPage";
import UsuarioPage from "../pages/common/usuario/UsuarioPage";
import SectorPage from "../pages/common/sector/SectorPage";
import ProveedorPage from "../pages/common/proveedor/ProveedorPage";
import ProductoPage from "../pages/common/producto/ProductoPage";
import NivelPrioridadPage from "../pages/common/nivelPrioridad/PrioridadPage";

// (Opcional) Importa otros componentes si tienes rutas específicas para proveedores, etc.
// import ProveedoresPage from "../pages/common/ProveedoresPage"; 

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 1. Login y Redirección Raíz */}
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Login />} />

                {/* 2. RUTA UNIFICADA: SOLICITUDES */}
                {/* Admin verá su panel, Calidad/Gerencia verán la lista de aprobación */}
                <Route
                    path="/solicitudes"
                    element={
                        <ProtectRoute allowedRole={['ADMINISTRACION', 'CALIDAD', 'GERENCIA']}>
                            <SolicitudesWrapper />
                        </ProtectRoute>
                    }
                />

                {/* 3. SUB-RUTA: CREAR (Exclusiva Admin) */}
                <Route
                    path="/solicitudes/nueva"
                    element={
                        <ProtectRoute allowedRole={['ADMINISTRACION', 'CALIDAD', 'GERENCIA']}>
                            <CrearSolicitud />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/usuario/nuevo"
                    element={
                        <ProtectRoute allowedRole={['GERENCIA']}>
                            <CrearUsuario />
                        </ProtectRoute>
                    }
                />

                {/* 4. RUTA UNIFICADA: PRESUPUESTOS */}
                <Route
                    path="/presupuestos"
                    element={
                        <ProtectRoute allowedRole={['CALIDAD', 'GERENCIA']}>
                            <PresupuestosPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/compras"
                    element={
                        <ProtectRoute allowedRole={['CALIDAD', 'GERENCIA']}>
                            <CompraPage />
                        </ProtectRoute>
                    }
                />

                <Route
                    path="/evalEntrega"
                    element={
                        <ProtectRoute allowedRole={['CALIDAD', 'GERENCIA']}>
                            <EvalEntregasPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/evalProveedor"
                    element={
                        <ProtectRoute allowedRole={['CALIDAD', 'GERENCIA']}>
                            <EvalProveedorPage />
                        </ProtectRoute>
                    }
                />

                <Route
                    path="/aprobSolicitud"
                    element={
                        <ProtectRoute allowedRole={['GERENCIA']}>
                            <AprobSoliPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/aprobPresupuesto"
                    element={
                        <ProtectRoute allowedRole={['GERENCIA']}>
                            <AprobPresuPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/cierre"
                    element={
                        <ProtectRoute allowedRole={['GERENCIA']}>
                            <CierrePage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/documentacion"
                    element={
                        <ProtectRoute allowedRole={['GERENCIA']}>
                            <DocPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/usuarios"
                    element={
                        <ProtectRoute allowedRole={['GERENCIA']}>
                            <UsuarioPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/sector"
                    element={
                        <ProtectRoute allowedRole={['GERENCIA']}>
                            <SectorPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/proveedor"
                    element={
                        <ProtectRoute allowedRole={['GERENCIA']}>
                            <ProveedorPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/producto"
                    element={
                        <ProtectRoute allowedRole={['GERENCIA']}>
                            <ProductoPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/nivelPrioridad"
                    element={
                        <ProtectRoute allowedRole={['GERENCIA']}>
                            <NivelPrioridadPage />
                        </ProtectRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;