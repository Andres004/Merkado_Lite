"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, DollarSign, Percent, Users, Settings, MessageCircle } from "lucide-react";


const navItems = [
  { name: "Panel de Control", href: "/administrador", icon: LayoutDashboard },
  { name: "Gestión de Pedidos", href: "/administrador/pedidos", icon: ShoppingCart },
  { name: "Inventario", href: "/administrador/inventario", icon: Package },
  { name: "Ventas", href: "/administrador/ventas", icon: DollarSign },
  { name: "Descuentos", href: "/administrador/descuentos", icon: Percent },
  { name: "Usuarios", href: "/administrador/usuarios", icon: Users },
  { name: "Soporte", href: "/administrador/soporte", icon: MessageCircle },
  { name: "Configuración", href: "/administrador/configuracion", icon: Settings },
];


export default function AdminSidebar() {
  const pathname = usePathname();


  return (
    <div className="w-full bg-white shadow-xl rounded-xl p-4 sticky top-4 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Panel de Control</h2>


      <nav>
        {navItems.map((item) => {
          const isActive = pathname === item.href;


          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg mb-1 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#F40009] text-white shadow-md"
                  : "text-gray-700 hover:bg-red-50 hover:text-[#F40009]"
              }`}
            >
              <item.icon size={20} className="mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
