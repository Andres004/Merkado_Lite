"use client";

import { useEffect, useRef, useState } from "react";
import { RoleModel } from "../../../models/user.model";

interface UserFormValues {
  fullName: string;
  ci: string;  
  email: string;
  password: string;
  roleId: number | null;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
  roles: RoleModel[];
  title: string;
  confirmLabel: string;
  loading?: boolean;
  initialValues?: Partial<UserFormValues>;
  passwordOptional?: boolean;
}

const generatePassword = () => {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789@$!%*?&";
  let result = "";
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }
  return result;
};

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  roles,
  title,
  confirmLabel,
  loading,
  initialValues,
  passwordOptional,
}: UserFormModalProps) {
  const [form, setForm] = useState<UserFormValues>({
    fullName: initialValues?.fullName || "",
    ci: initialValues?.ci || "", 
    email: initialValues?.email || "",
    password: initialValues?.password || "",
    roleId: initialValues?.roleId ?? null,
  });
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({
        fullName: initialValues?.fullName || "",
        ci: initialValues?.ci || "",  
        email: initialValues?.email || "",
        password: "",
        roleId: initialValues?.roleId ?? null,
      });
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") onClose();
      };

      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => firstInputRef.current?.focus(), 0);

      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [initialValues, isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleChange = (field: keyof UserFormValues, value: string | number) => {
    if (field === "roleId") {
      setForm((prev) => ({ ...prev, roleId: Number(value) }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value as string }));
  };

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || (!form.password.trim() && !passwordOptional)) return;
    if (!form.roleId) return;
    await onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleOverlayClick}>
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200 mx-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="space-y-4" onSubmit={submitForm}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input
              ref={firstInputRef}
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="nombre del usuario"
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CI</label>
            <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Carnet de identidad"
                value={form.ci}
                onChange={(e) => handleChange("ci", e.target.value)}
                required
            />
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Correo del usuario"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">{passwordOptional ? "Contraseña" : "Contraseña temporal"}</label>
              {!passwordOptional && (
                <button
                  type="button"
                  onClick={() => handleChange("password", generatePassword())}
                  className="text-sm text-red-600 font-semibold hover:text-red-700"
                >
                  Generar
                </button>
              )}
            </div>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              {...(passwordOptional ? {} : { required: true })}
            />
            {passwordOptional && <p className="text-xs text-gray-500 mt-1">Déjalo vacío si no deseas cambiarla.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignar Rol</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={form.roleId ?? ""}
              onChange={(e) => handleChange("roleId", e.target.value)}
              required
            >
              <option value="" disabled>
                Elegir un rol
              </option>
              {roles.map((role) => (
                <option key={role.id_rol} value={role.id_rol}>
                  {role.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-[#F40009] text-white font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}