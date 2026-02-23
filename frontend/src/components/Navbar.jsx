import React, { useState } from 'react';
import { LayoutDashboard, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // --- LÓGICA DE ROL ---
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

    const visibleLinks = NAV_LINKS.filter(link => link.allowedRoles.includes(userRole));

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            {/* max-w-screen-2xl para darle el máximo ancho posible a la barra */}
            <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-6">
                <div className="flex justify-between items-center h-16">

                    {/* 1. LOGO - ESCUDO IZQUIERDO (Fondo blanco y shrink-0 para que nunca se aplaste) */}
                    <div className="flex items-center gap-2 font-bold text-lg text-[#1C5B5A] shrink-0 z-10 bg-white pr-2 xl:pr-6 cursor-default">
                        <div className="w-8 h-8 bg-[#1C5B5A] rounded-lg flex items-center justify-center text-white shadow-sm">
                            <LayoutDashboard size={18} />
                        </div>
                        <span className="hidden xl:inline">VN Gestión de compras</span>
                    </div>

                    {/* 2. NAVEGACIÓN CENTRAL (Letra más pequeña en pantallas medianas) */}
                    <nav className="hidden lg:flex flex-1 justify-center items-center gap-0.5 xl:gap-2 flex-nowrap">
                        {visibleLinks.map((link) => {
                            if (link.subLinks) {
                                const isSubLinkActive = link.subLinks.some(sub => location.pathname === sub.path);

                                return (
                                    <div key={link.name} className="relative group h-16 flex items-center">
                                        <button
                                            /* text-[11px] en pantallas normales, text-sm en pantallas gigantes */
                                            className={`flex items-center gap-1 text-[11px] xl:text-sm font-bold px-1.5 xl:px-3 h-full border-b-2 transition-all whitespace-nowrap
                                                ${isSubLinkActive
                                                    ? 'text-[#1C5B5A] border-[#1C5B5A] bg-emerald-50/50'
                                                    : 'text-slate-500 border-transparent hover:text-[#1C5B5A] hover:bg-slate-50'
                                                }`}
                                        >
                                            {link.name} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                                        </button>

                                        {/* Menú Flotante */}
                                        <div className="absolute left-0 top-full w-48 bg-white border border-slate-200 shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2 z-50">
                                            {link.subLinks.map((subLink) => {
                                                if (!subLink.allowedRoles.includes(userRole)) return null;
                                                return (
                                                    <Link
                                                        key={subLink.path}
                                                        to={subLink.path}
                                                        className={`px-4 py-2.5 text-sm font-medium transition-colors ${location.pathname === subLink.path
                                                                ? 'text-[#1C5B5A] bg-emerald-50/50 border-l-2 border-[#1C5B5A]'
                                                                : 'text-slate-600 hover:text-[#1C5B5A] hover:bg-slate-50 border-l-2 border-transparent'
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
                                    /* text-[11px] en pantallas normales, text-sm en pantallas gigantes */
                                    className={`flex items-center h-16 text-[11px] xl:text-sm font-bold px-1.5 xl:px-3 border-b-2 transition-all whitespace-nowrap ${location.pathname === link.path
                                            ? 'text-[#1C5B5A] border-[#1C5B5A] bg-emerald-50/50'
                                            : 'text-slate-500 border-transparent hover:text-[#1C5B5A] hover:bg-slate-50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* 3. PERFIL Y SALIR - ESCUDO DERECHO (Fondo blanco y z-10 para evitar superposiciones) */}
                    <div className="flex items-center gap-1 xl:gap-3 shrink-0 z-10 bg-white pl-2 xl:pl-4">
                        <div className="hidden sm:flex items-center gap-2 bg-slate-50 p-1.5 xl:px-3 xl:py-1.5 rounded-full border border-slate-100">
                            <div className="w-7 h-7 bg-[#1C5B5A] text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                                {user?.username?.substring(0, 2).toUpperCase()}
                            </div>
                            {/* Ocultamos el nombre en laptops para ahorrar espacio, solo dejamos iniciales */}
                            <span className="hidden xl:block text-xs font-bold text-slate-700 pr-1">{user?.username}</span>
                        </div>

                        <button
                            onClick={() => logout(false)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={20} />
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 text-slate-500 hover:text-[#1C5B5A] transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Menú Móvil */}
            {isMenuOpen && (
                <div className="lg:hidden bg-white border-t border-slate-200 shadow-xl absolute w-full left-0 top-full flex flex-col animate-in slide-in-from-top-2 z-50 overflow-y-auto max-h-[calc(100vh-64px)]">
                    <nav className="flex flex-col py-2">
                        {visibleLinks.map((link) => {
                            if (link.subLinks) {
                                return (
                                    <div key={link.name} className="flex flex-col">
                                        <div className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                                            {link.name}
                                        </div>
                                        {link.subLinks.map((subLink) => {
                                            if (!subLink.allowedRoles.includes(userRole)) return null;
                                            return (
                                                <Link
                                                    key={subLink.path}
                                                    to={subLink.path}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className={`pl-10 pr-6 py-3 text-sm font-bold transition-colors ${location.pathname === subLink.path
                                                            ? 'bg-emerald-50 text-[#1C5B5A] border-l-4 border-[#1C5B5A]'
                                                            : 'text-slate-600 border-transparent hover:bg-slate-50'
                                                        }`}
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
                                    className={`px-6 py-4 text-sm font-bold transition-colors ${location.pathname === link.path
                                            ? 'bg-emerald-50 text-[#1C5B5A] border-l-4 border-[#1C5B5A]'
                                            : 'text-slate-600 border-l-4 border-transparent hover:bg-slate-50'
                                        }`}
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
