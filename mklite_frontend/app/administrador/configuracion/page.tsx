"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";

const STORAGE_KEY = "adminPanelSettings";

const defaultSettings = {
  currency: "Bs.",
  primaryColor: "rojo",
  showClients: true,
  userFilter: "Todos",
};

type Settings = typeof defaultSettings;

const colorClasses: Record<Settings["primaryColor"], string> = {
  rojo: "bg-red-600 hover:bg-red-700 text-white",
  azul: "bg-blue-600 hover:bg-blue-700 text-white",
  verde: "bg-green-600 hover:bg-green-700 text-white",
};

export default function AdminConfigurationPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("No se pudieron cargar las preferencias locales", error);
      }
    }
  }, []);

  const primaryButtonClass = useMemo(() => {
    return colorClasses[settings.primaryColor] || colorClasses.rojo;
  }, [settings.primaryColor]);

  const handleChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setStatusMessage("");
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setStatusMessage("Preferencias guardadas localmente.");
  };

  const handleReset = () => {
    const confirmed = window.confirm("¿Restablecer preferencias a los valores predeterminados?");
    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    setSettings(defaultSettings);
    setStatusMessage("Preferencias restablecidas.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="hidden lg:block lg:col-span-3">
            <AdminSidebar />
          </div>

          <div className="col-span-12 lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                {/* CAMBIO: Título negro y descripción oscura */}
                <h1 className="text-2xl font-bold text-black">Configuración del Panel</h1>
                <p className="text-gray-800 font-medium text-sm">
                  Ajusta preferencias básicas. Los cambios se guardan solo en este navegador usando localStorage.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Moneda */}
                  <div className="space-y-2">
                    {/* CAMBIO: Label negro y negrita */}
                    <label className="block text-sm font-bold text-gray-900">Moneda mostrada</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleChange("currency", e.target.value as Settings["currency"])}
                      // CAMBIO: Texto negro dentro del select
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-black font-medium"
                    >
                      <option value="Bs.">Bs.</option>
                      <option value="$">$</option>
                      <option value="USD">USD</option>
                    </select>
                    <p className="text-xs text-gray-600">Se usará para mostrar importes en las vistas administrativas.</p>
                  </div>

                  {/* Color Principal */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-900">Color principal del panel</label>
                    <select
                      value={settings.primaryColor}
                      onChange={(e) => handleChange("primaryColor", e.target.value as Settings["primaryColor"])}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-black font-medium"
                    >
                      <option value="rojo">rojo</option>
                      <option value="azul">azul</option>
                      <option value="verde">verde</option>
                    </select>
                    <p className="text-xs text-gray-600">Afecta solo los botones principales de esta sección.</p>
                  </div>

                  {/* Mostrar Clientes */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-900">Mostrar clientes en Usuarios</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleChange("showClients", !settings.showClients)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors duration-200 ${
                          settings.showClients ? "bg-green-600 border-green-600" : "bg-gray-300 border-gray-300"
                        }`}
                        aria-pressed={settings.showClients}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            settings.showClients ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="text-sm text-gray-900 font-medium">
                        {settings.showClients ? "Visible" : "Oculto"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Controla si los clientes aparecen en la sección Usuarios.</p>
                  </div>

                  {/* Filtros por defecto */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-900">Filtros por defecto en Usuarios</label>
                    <select
                      value={settings.userFilter}
                      onChange={(e) => handleChange("userFilter", e.target.value as Settings["userFilter"])}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-black font-medium"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Repartidores">Repartidores</option>
                      <option value="Clientes">Clientes</option>
                    </select>
                    <p className="text-xs text-gray-600">Se aplicará al abrir la lista de Usuarios.</p>
                  </div>
                </div>

                {/* Footer de botones */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-gray-200">
                  {statusMessage && <span className="text-sm text-gray-800 font-medium">{statusMessage}</span>}
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-900 font-medium hover:bg-gray-100 transition"
                    >
                      Restablecer
                    </button>
                    <button
                      onClick={handleSave}
                      className={`px-4 py-2 rounded-lg font-bold shadow ${primaryButtonClass}`}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}