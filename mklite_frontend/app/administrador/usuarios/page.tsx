"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { getUsers, createUser, updateUser, deleteUser, updateUserStatus } from "../../services/user.service";
import { getRoles } from "../../services/role.service";
import { RoleModel, UserModel } from "../../models/user.model";
import { X, AlertTriangle, Loader2 } from "lucide-react";

// --- ESTILOS VISUALES ---
const roleStyles: Record<string, { label: string; classes: string }> = {
  administrador: { label: "Administrador", classes: "bg-red-100 text-red-800" },
  ventas: { label: "Ventas", classes: "bg-blue-100 text-blue-800" },
  almacén: { label: "Almacén", classes: "bg-purple-100 text-purple-800" },
  almacen: { label: "Almacén", classes: "bg-purple-100 text-purple-800" },
  repartidor: { label: "Repartidor", classes: "bg-orange-100 text-orange-800" },
};

const statusStyles: Record<string, { label: string; classes: string }> = {
  activo: { label: "Activo", classes: "bg-green-100 text-green-800" },
  inactivo: { label: "Inactivo", classes: "bg-gray-200 text-gray-800" },
};

// --- COMPONENTES MODALES INTEGRADOS (Para aplicar estilos visuales) ---

interface ConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  helperText?: string;
  tone?: "danger" | "warning";
  confirmColor?: string;
}

const LocalConfirmModal = ({
  isOpen,
  onCancel,
  onConfirm,
  loading,
  title,
  description,
  confirmLabel,
  helperText,
  tone = "danger",
  confirmColor
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tone === 'warning' ? 'bg-orange-100' : 'bg-red-100'}`}>
            <AlertTriangle className={tone === 'warning' ? 'text-orange-600' : 'text-red-600'} size={28} />
          </div>
          <h3 className="text-xl font-bold text-black">{title}</h3>
          <p className="text-gray-900 font-medium">{description}</p>
          {helperText && <p className="text-gray-600 text-sm">{helperText}</p>}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 font-bold hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white font-bold transition shadow-sm disabled:opacity-50 ${
               confirmColor === 'orange' 
               ? 'bg-orange-600 hover:bg-orange-700' 
               : 'bg-[#F40009] hover:bg-red-700'
            }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: RoleModel[];
  title: string;
  confirmLabel: string;
  loading: boolean;
  passwordOptional: boolean;
  initialValues?: { fullName: string; ci?: string; email: string; roleId: number | null };
  onSubmit: (values: any) => void;
}

const LocalUserFormModal = ({
  isOpen,
  onClose,
  roles,
  title,
  confirmLabel,
  loading,
  passwordOptional,
  initialValues,
  onSubmit
}: UserFormModalProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    ci: "",
    email: "",
    password: "",
    roleId: "" as string | number
  });

  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        setFormData({
          fullName: initialValues.fullName || "",
          ci: initialValues.ci || "",
          email: initialValues.email || "",
          password: "",
          roleId: initialValues.roleId || ""
        });
      } else {
        setFormData({ fullName: "", ci: "", email: "", password: "", roleId: "" });
      }
    }
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      roleId: Number(formData.roleId)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-black">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#F40009] focus:border-[#F40009] text-black font-medium"
              placeholder="Ej: Juan Perez"
            />
          </div>

          {!initialValues && (
             <div>
             <label className="block text-sm font-bold text-gray-900 mb-1">CI / Carnet</label>
             <input
               type="text"
               required={!initialValues}
               value={formData.ci}
               onChange={(e) => setFormData({...formData, ci: e.target.value})}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#F40009] focus:border-[#F40009] text-black font-medium"
               placeholder="Ej: 1234567"
             />
           </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#F40009] focus:border-[#F40009] text-black font-medium"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Contraseña {passwordOptional && <span className="text-gray-500 font-normal text-xs">(Opcional si no desea cambiarla)</span>}
            </label>
            <input
              type="password"
              required={!passwordOptional}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#F40009] focus:border-[#F40009] text-black font-medium"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Asignar Rol</label>
            <select
              required
              value={formData.roleId}
              onChange={(e) => setFormData({...formData, roleId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#F40009] focus:border-[#F40009] text-black font-medium bg-white"
            >
              <option value="">Seleccione un rol</option>
              {roles.map(role => (
                <option key={role.id_rol} value={role.id_rol}>
                  {role.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 font-bold hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#F40009] text-white font-bold hover:bg-red-700 transition shadow-md disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---

const parseFullName = (fullName: string) => {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return { nombre: parts[0], apellido: "" };
  const nombre = parts.shift() || "";
  const apellido = parts.join(" ");
  return { nombre, apellido };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserModel | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    user: UserModel;
    type: "delete" | "status";
  } | null>(null);

  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [limit, total]);

  const loadRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (e) {
      setRoles([]);
    }
  };

  const loadUsers = async (pageToLoad = page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers({ page: pageToLoad, limit });
      setUsers(response.data || []);
      setTotal(response.total || 0);
    } catch (e) {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [page]);

  const currentRoleName = (user: UserModel) =>
    user.userRoles?.[0]?.role?.nombre || "";

  const getRoleChip = (roleName: string) => {
    const key = roleName.toLowerCase();
    return roleStyles[key] || { label: roleName || "Sin rol", classes: "bg-gray-100 text-gray-700" };
  };

  const fullName = (user: UserModel) => `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim();

  const openCreateModal = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const openEditModal = (user: UserModel) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleCreateOrUpdate = async (values: { fullName: string; ci: string; email: string; password: string; roleId: number | null }) => {
    setSaving(true);
    const { nombre, apellido } = parseFullName(values.fullName);
    try {
      if (editingUser?.id_usuario) {
        await updateUser(editingUser.id_usuario, {
          nombre,
          apellido,
          email: values.email,
          password: values.password || undefined,
          id_rol: values.roleId || undefined,
        });
      } else {
        await createUser({
          nombre,
          apellido,
          ci: values.ci,
          email: values.email,
          password: values.password,
          id_rol: values.roleId as number,
        });
      }
      setIsFormOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (e) {
      setError('Ocurrió un error al guardar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirmAction?.user.id_usuario) return;
    setConfirming(true);
    const nextStatus = (confirmAction.user.accountStatus  || 'activo').toLowerCase() === 'activo' ? 'inactivo' : 'activo';
    try {
      await updateUserStatus(confirmAction.user.id_usuario, nextStatus);
      await loadUsers();
      setConfirmAction(null);
    } catch (e) {
      setError('No se pudo actualizar el estado del usuario.');
    } finally {
      setConfirming(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmAction?.user.id_usuario) return;
    setConfirming(true);
    try {
      await deleteUser(confirmAction.user.id_usuario);
      await loadUsers();
      setConfirmAction(null);
    } catch (e) {
      setError('No se pudo eliminar el usuario.');
    } finally {
      setConfirming(false);
    }
  };

  const openStatusModal = (user: UserModel) => {
    setConfirmAction({ user, type: "status" });
  };

  const openDeleteModal = (user: UserModel) => {
    setConfirmAction({ user, type: "delete" });
  };

  const statusLabel = (user: UserModel): "activo" | "inactivo" => {
    if (!user || !user.accountStatus ) return "activo";
    const value = user.accountStatus.toString().trim().toLowerCase();
    return value === "inactivo" ? "inactivo" : "activo";
  };

  const renderPagination = () => {
    const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);
    return (
      <div className="flex items-center space-x-2 justify-center mt-6">
        <button
          className="px-3 py-1 rounded-full border border-gray-300 text-gray-800 font-medium hover:bg-gray-100 disabled:opacity-50"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
        >
          «
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 rounded-full border font-bold ${
              p === page ? "bg-[#F40009] text-white border-[#F40009]" : "border-gray-300 text-gray-800 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded-full border border-gray-300 text-gray-800 font-medium hover:bg-gray-100 disabled:opacity-50"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page === totalPages}
        >
          »
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="hidden lg:block lg:col-span-3">
            <AdminSidebar />
          </div>

          <div className="col-span-12 lg:col-span-9">
            <div className="flex items-center justify-between mb-6">
              <div>
                {/* CAMBIO: Texto negro */}
                <h1 className="text-2xl font-bold text-black">Gestión de Usuarios y Roles</h1>
                <p className="text-gray-800 text-sm font-medium">Administra los usuarios, sus roles y estado.</p>
              </div>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 rounded-lg bg-[#F40009] text-white font-bold shadow hover:bg-red-700 transition"
              >
                Crear Nuevo Usuario
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    {/* CAMBIO: Headers negros */}
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Nombre Completo</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Email/Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-gray-600 font-medium">
                          Cargando usuarios...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-gray-600 font-medium">
                          No hay usuarios registrados.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => {
                        const roleName = currentRoleName(user);
                        const roleChip = getRoleChip(roleName);
                        const statusKey = statusLabel(user);
                        const statusChip = statusStyles[statusKey] || statusStyles.activo;
                        const isActive = statusKey === "activo";
                        
                        return (
                          <tr key={user.id_usuario} className="hover:bg-red-50 transition duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">{fullName(user)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleChip.classes}`}>
                                {roleChip.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusChip.classes}`}>
                                {statusChip.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 space-x-4 font-medium">
                              <button className="text-[#F40009] font-bold hover:underline" onClick={() => openEditModal(user)}>
                                Editar
                              </button>
                              <button className="text-gray-600 font-bold hover:underline hover:text-black" onClick={() => openDeleteModal(user)}>
                                Eliminar
                              </button>
                              {isActive ? (
                                <button className="text-gray-800 font-bold hover:underline hover:text-black" onClick={() => openStatusModal(user)}>
                                  Desactivar
                                </button>
                              ) : (
                                <button className="text-green-700 font-bold hover:underline" onClick={() => openStatusModal(user)}>
                                  Activar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {renderPagination()}
            {error && <p className="text-red-600 mt-3 font-medium">{error}</p>}
          </div>
        </div>
      </div>

      {/* --- USO DE LOS MODALES LOCALES --- */}
      <LocalUserFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingUser(null); }}
        roles={roles}
        title={editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
        confirmLabel={editingUser ? "Guardar Cambios" : "Crear Usuario"}
        loading={saving}
        passwordOptional={Boolean(editingUser)}
        initialValues={editingUser ? { fullName: fullName(editingUser), ci: editingUser.ci, email: editingUser.email, roleId: editingUser.userRoles?.[0]?.id_rol || editingUser.userRoles?.[0]?.role?.id_rol || null } : undefined}
        onSubmit={handleCreateOrUpdate}
      />

      <LocalConfirmModal
        isOpen={Boolean(confirmAction && confirmAction.type === "status")}
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleToggleStatus}
        loading={confirming}
        tone="warning"
        title={(confirmAction?.user.accountStatus  || 'activo').toLowerCase() === 'activo' ? "¿Desactivar Usuario?" : "¿Activar Usuario?"}
        description={`Estás a punto de ${(confirmAction?.user.accountStatus  || 'activo').toLowerCase() === 'activo' ? 'desactivar' : 'activar'} la cuenta de "${confirmAction ? fullName(confirmAction.user) : ''}".`}
        confirmLabel={(confirmAction?.user.accountStatus  || 'activo').toLowerCase() === 'activo' ? "Sí, Desactivar" : "Sí, Activar"}
        confirmColor="orange"
      />

      <LocalConfirmModal
        isOpen={Boolean(confirmAction && confirmAction.type === "delete")}
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleDelete}
        loading={confirming}
        title="¿Estás seguro?"
        description={`Estás a punto de eliminar permanentemente la cuenta de "${confirmAction ? fullName(confirmAction.user) : ''}".`}
        helperText="Esta acción no se puede deshacer."
        confirmLabel="Sí, Eliminar"
      />
    </div>
  );
}