import React, { useState } from 'react';
import { LayoutDashboard, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getRoleName = (u) => {
        if (!u) return "";
        if (u.rol && typeof u.rol === 'string') return u.rol.toUpperCase();
        return "";
    };

    const userRole = getRoleName(user);

    const NAV_LINKS = [
        { name: 'Usuarios', path: '/usuarios', allowedRoles: ['GERENCIA'] },
        { name: 'Solicitudes', path: '/solicitudes', allowedRoles: ['ADMINISTRACION', 'CALIDAD', 'GERENCIA'] },
        { name: 'Presupuestos', path: '/presupuestos', allowedRoles: ['CALIDAD', 'GERENCIA'] },
        { name: 'Compras', path: '/compras', allowedRoles: ['CALIDAD', 'GERENCIA'] },
        {
            name: 'Evaluaciones',
            allowedRoles: ['CALIDAD', 'GERENCIA'],
            subLinks: [
                { name: 'Eval. Entrega', path: '/evalEntrega', allowedRoles: ['CALIDAD', 'GERENCIA'] },
                { name: 'Eval. Proveedor', path: '/evalProveedor', allowedRoles: ['CALIDAD', 'GERENCIA'] }
            ]
        },
        {
            name: 'Aprobaciones',
            allowedRoles: ['GERENCIA'],
            subLinks: [
                { name: 'Aprob. Solicitud', path: '/aprobSolicitud', allowedRoles: ['GERENCIA'] },
                { name: 'Aprob. Presupuesto', path: '/aprobPresupuesto', allowedRoles: ['GERENCIA'] }
            ]
        },
        { name: 'Cierre', path: '/cierre', allowedRoles: ['GERENCIA'] },
        { name: 'Documentación', path: '/documentacion', allowedRoles: ['GERENCIA'] },
        {
            name: 'Otros',
            allowedRoles: ['GERENCIA'],
            subLinks: [
                { name: 'Sector', path: '/sector', allowedRoles: ['GERENCIA'] },
                { name: 'Proveedor', path: '/proveedor', allowedRoles: ['GERENCIA'] },
                { name: 'Producto', path: '/producto', allowedRoles: ['GERENCIA'] },
                { name: 'Nivel Prioridad', path: '/nivelPrioridad', allowedRoles: ['GERENCIA'] },
            ]
        }
    ];

    const visibleLinks = NAV_LINKS.filter(link =>
        link.allowedRoles.includes(userRole)
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
                                                if (!subLink.allowedRoles.includes(userRole)) return null;

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
                <div className="xl:hidden bg-white border-t border-slate-200 shadow-xl absolute w-full left-0 top-full z-50">

                    <nav className="flex flex-col py-2">

                        {visibleLinks.map((link) => {

                            if (link.subLinks) {
                                return (
                                    <div key={link.name} className="flex flex-col">
                                        <div className="px-6 py-2 text-xs font-bold text-slate-400 uppercase bg-slate-50">
                                            {link.name}
                                        </div>

                                        {link.subLinks.map((subLink) => {
                                            if (!subLink.allowedRoles.includes(userRole)) return null;

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