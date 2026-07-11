import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/login';
import ProtectRoute from "./ProtectRoute";

import SolicitudesWrapper from "../pages/common/SolicitudesWrapper";
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

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Login />} />

                <Route
                    path="/solicitudes"
                    element={
                        <ProtectRoute allowedPermission={['PERM_SOLICITUDES_ADMIN', 'PERM_APROBACIONES_VER', 'PERM_SOLICITUDES_VER']}>
                            <SolicitudesWrapper />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/solicitudes/nueva"
                    element={
                        <ProtectRoute allowedPermission="PERM_SOLICITUDES_CREAR">
                            <CrearSolicitud />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/usuario/nuevo"
                    element={
                        <ProtectRoute allowedPermission="PERM_USUARIOS_ADMIN">
                            <CrearUsuario />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/presupuestos"
                    element={
                        <ProtectRoute allowedPermission="PERM_PRESUPUESTOS">
                            <PresupuestosPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/compras"
                    element={
                        <ProtectRoute allowedPermission="PERM_COMPRAS">
                            <CompraPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/evalEntrega"
                    element={
                        <ProtectRoute allowedPermission="PERM_EVAL_ENTREGA">
                            <EvalEntregasPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/evalProveedor"
                    element={
                        <ProtectRoute allowedPermission="PERM_EVAL_PROVEEDOR">
                            <EvalProveedorPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/aprobSolicitud"
                    element={
                        <ProtectRoute allowedPermission="PERM_APROBACIONES_VER">
                            <AprobSoliPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/aprobPresupuesto"
                    element={
                        <ProtectRoute allowedPermission="PERM_APROBACIONES_VER">
                            <AprobPresuPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/cierre"
                    element={
                        <ProtectRoute allowedPermission="PERM_CIERRES">
                            <CierrePage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/documentacion"
                    element={
                        <ProtectRoute allowedPermission="PERM_DOCUMENTACION">
                            <DocPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/usuarios"
                    element={
                        <ProtectRoute allowedPermission="PERM_USUARIOS_ADMIN">
                            <UsuarioPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/sector"
                    element={
                        <ProtectRoute allowedPermission="PERM_USUARIOS_ADMIN">
                            <SectorPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/proveedor"
                    element={
                        <ProtectRoute allowedPermission="PERM_PROVEEDORES_ADMIN">
                            <ProveedorPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/producto"
                    element={
                        <ProtectRoute allowedPermission="PERM_PRODUCTOS_ADMIN">
                            <ProductoPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/nivelPrioridad"
                    element={
                        <ProtectRoute allowedPermission="PERM_PRIORIDADES_ADMIN">
                            <NivelPrioridadPage />
                        </ProtectRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;