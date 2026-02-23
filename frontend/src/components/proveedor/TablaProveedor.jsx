import React from "react";
import { Eye } from "lucide-react";

export default function TablaProveedor({ proveedores, onSelect }) {
    return (
        <div className="bg-white shadow-sm rounded-lg border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-slate-50">
                    <tr className="text-left text-slate-600">
                        <th className="p-3">ID</th>
                        <th className="p-3">Empresa</th>
                        <th className="p-3">Nombre del contacto</th>
                        <th className="p-3">Email</th>
                        <th className="p-3 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {proveedores.map((prov) => (
                        <tr
                            key={prov.idProveedor}
                            className="border-t hover:bg-slate-50"
                        >
                            <td className="p-3">{prov.idProveedor}</td>
                            <td className="p-3">{prov.nombreEmpresa}</td>
                            <td className="p-3">{prov.nombreContacto}</td>
                            <td className="p-3">{prov.email}</td>
                            <td className="p-3 flex justify-center">
                                <button
                                    onClick={() => onSelect(prov)}
                                    className="p-2 rounded hover:bg-slate-100"
                                    title="Evaluar"
                                >
                                    <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
