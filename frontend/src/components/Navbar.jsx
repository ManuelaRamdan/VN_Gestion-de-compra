import React, { useState } from 'react';
import { LayoutDashboard, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const permisos = user?.permisos || [];
    const tienePermiso = (requeridos = []) => requeridos.some(p => permisos.includes(p));

    const NAV_LINKS = [
        { name: 'Usuarios', path: '/usuarios', allowedPermissions: ['PERM_USUARIOS_ADMIN', 'PERM_USUARIOS_EDITAR', 'PERM_USUARIOS_BORRAR', 'PERM_USUARIOS_VER'] },
        { name: 'Solicitudes', path: '/solicitudes', allowedPermissions: ['PERM_SOLICITUDES_ADMIN', 'PERM_APROBACIONES_VER', 'PERM_SOLICITUDES_VER'] },
        { name: 'Presupuestos', path: '/presupuestos', allowedPermissions: ['PERM_PRESUPUESTOS'] },
        {
            name: 'Aprobaciones',
            allowedPermissions: ['PERM_APROBACIONES_VER'],
            subLinks: [
                { name: 'Aprob. Solicitud', path: '/aprobSolicitud', allowedPermissions: ['PERM_APROB_SOLI_PENDIENTES_VER', 'PERM_APROB_SOLI_ACEPTADAS_VER', 'PERM_APROB_SOLI_RECHAZADAS_VER', 'PERM_APROB_SOLI_GESTIONAR'] },
                { name: 'Aprob. Presupuesto', path: '/aprobPresupuesto', allowedPermissions: ['PERM_APROBACIONES_VER'] }
            ]
        },
        { name: 'Compras', path: '/compras', allowedPermissions: ['PERM_COMPRAS'] },
        {
            name: 'Evaluaciones',
            allowedPermissions: ['PERM_EVAL_ENTREGA', 'PERM_EVAL_PROVEEDOR'],
            subLinks: [
                { name: 'Eval. Entrega', path: '/evalEntrega', allowedPermissions: ['PERM_EVAL_ENTREGA'] },
                { name: 'Eval. Proveedor', path: '/evalProveedor', allowedPermissions: ['PERM_EVAL_PROVEEDOR'] }
            ]
        },
        { name: 'Cierre', path: '/cierre', allowedPermissions: ['PERM_CIERRES'] },
        { name: 'Documentación', path: '/documentacion', allowedPermissions: ['PERM_DOCUMENTACION'] },
        {
            name: 'Otros',
            allowedPermissions: ['PERM_USUARIOS_ADMIN', 'PERM_PROVEEDORES_ADMIN', 'PERM_PRODUCTOS_ADMIN', 'PERM_PRODUCTOS_VER', 'PERM_PRIORIDADES_ADMIN', 'PERM_PRIORIDADES_VER'],
            subLinks: [
                { name: 'Sector', path: '/sector', allowedPermissions: ['PERM_SECTOR_ADMIN', 'PERM_SECTOR_EDITAR', 'PERM_SECTOR_BORRAR', 'PERM_SECTOR_CREAR', 'PERM_SECTOR_VER'] },
                { name: 'Proveedor', path: '/proveedor', allowedPermissions: ['PERM_PROVEEDORES_ADMIN', 'PERM_PROVEEDORES_EDITAR', 'PERM_PROVEEDORES_BORRAR', 'PERM_PROVEEDORES_VER'] },
                { name: 'Producto', path: '/producto', allowedPermissions: ['PERM_PRODUCTOS_ADMIN', 'PERM_PRODUCTOS_EDITAR', 'PERM_PRODUCTOS_BORRAR', 'PERM_PRODUCTOS_VER'] },
                { name: 'Nivel Prioridad', path: '/nivelPrioridad', allowedPermissions: ['PERM_PRIORIDADES_ADMIN', 'PERM_PRIORIDADES_EDITAR', 'PERM_PRIORIDADES_BORRAR', 'PERM_PRIORIDADES_VER'] },]
        }
    ];

    const visibleLinks = NAV_LINKS.filter(link =>
        tienePermiso(link.allowedPermissions)
    );

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">

            <div className="max-w-screen-2xl mx-auto px-4">
                <div className="flex items-center justify-between h-16 gap-4">

                    {/* LOGO */}
                    <div className="flex items-center gap-2 font-bold text-lg text-[#1C5B5A] shrink-0">
                        <div className="w-8 h-8 bg-[#1C5B5A] rounded-lg flex items-center justify-center text-white shadow-sm">
                            <LayoutDashboard size={18} />
                        </div>
                        <span className="hidden xl:block whitespace-nowrap">
                            VN Gestión de compras
                        </span>
                    </div>

                    {/* NAV DESKTOP */}
                    <nav className="hidden xl:flex flex-1 items-center justify-center gap-1 flex-wrap min-w-0">

                        {visibleLinks.map((link) => {

                            if (link.subLinks) {
                                const isSubActive = link.subLinks.some(
                                    sub => location.pathname === sub.path
                                );

                                return (
                                    <div key={link.name} className="relative group">

                                        <button
                                            className={`flex items-center gap-1 text-sm font-bold px-3 py-2 rounded-md transition-all whitespace-nowrap
                                            ${isSubActive
                                                    ? 'text-[#1C5B5A] bg-emerald-50'
                                                    : 'text-slate-500 hover:text-[#1C5B5A] hover:bg-slate-50'
                                                }`}
                                        >
                                            {link.name}
                                            <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                                        </button>

                                        <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-slate-200 shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2 z-50">

                                            {link.subLinks.map((subLink) => {
                                                if (!tienePermiso(subLink.allowedPermissions)) return null;

                                                return (
                                                    <Link
                                                        key={subLink.path}
                                                        to={subLink.path}
                                                        className={`px-4 py-2 text-sm font-medium transition-colors
                                                        ${location.pathname === subLink.path
                                                                ? 'text-[#1C5B5A] bg-emerald-50'
                                                                : 'text-slate-600 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {subLink.name}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`text-sm font-bold px-3 py-2 rounded-md transition-all whitespace-nowrap
                                    ${location.pathname === link.path
                                            ? 'text-[#1C5B5A] bg-emerald-50'
                                            : 'text-slate-500 hover:text-[#1C5B5A] hover:bg-slate-50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* PERFIL + LOGOUT */}
                    <div className="flex items-center gap-3 shrink-0">

                        <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 max-w-[180px]">
                            <div className="w-7 h-7 bg-[#1C5B5A] text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                {user?.username?.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="truncate text-xs font-bold text-slate-700">
                                {user?.username}
                            </span>
                        </div>

                        <button
                            onClick={() => logout(false)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={20} />
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="xl:hidden p-2 text-slate-500 hover:text-[#1C5B5A]"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            {isMenuOpen && (
                <div className="xl:hidden bg-white border-t border-slate-200 shadow-xl absolute w-full left-0 top-full z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
                    <nav className="flex flex-col py-2">

                        {visibleLinks.map((link) => {

                            if (link.subLinks) {
                                return (
                                    <div key={link.name} className="flex flex-col">
                                        <div className="px-6 py-2 text-xs font-bold text-slate-400 uppercase bg-slate-50">
                                            {link.name}
                                        </div>

                                        {link.subLinks.map((subLink) => {
                                            if (!tienePermiso(subLink.allowedPermissions)) return null;

                                            return (
                                                <Link
                                                    key={subLink.path}
                                                    to={subLink.path}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="pl-10 pr-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                                                >
                                                    {subLink.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}
        </header>
    );
}