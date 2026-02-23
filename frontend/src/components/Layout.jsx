// src/components/Layout.jsx
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans text-slate-800 flex flex-col">
      {/* 1. Aquí ponemos el Navbar fijo */}
      <Navbar />

      {/* 2. Aquí renderizamos el contenido específico de cada página */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      {/* 3. Aquí ponemos el Footer fijo */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-[10px] text-gray-400 text-center md:text-left">
            © 2026 Verificación Norte S.A. - Gestión de compras
          </p>
        </div>
      </footer>
    </div>
  );
}