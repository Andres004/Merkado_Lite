"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import instance from "../utils/axios";

const navItems = [
  { name: "Mis Entregas", href: "/repartidor" },
  { name: "Historial de Entregas", href: "/repartidor/historial" },
  { name: "Mi Perfil", href: "/repartidor/perfil" },
  //{ name: "Cerrar Sesión", href: "/logout" }, // Ruta placeholder
];

export default function RepartidorSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    }

    delete instance.defaults.headers.common.Authorization;

    router.push("/");
  };

  return (
    <div className="w-full lg:w-64 bg-white shadow-md rounded-lg p-3 lg:p-4 sticky top-20">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`block px-4 py-3 rounded-md mb-1 text-sm font-semibold transition-colors
              ${
                isActive
                  ? "bg-gray-100 text-gray-900 border-l-4 border-[#F40009]"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
          >
            {item.name}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={handleLogout}
        className="block w-full text-left px-4 py-3 rounded-md mt-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
