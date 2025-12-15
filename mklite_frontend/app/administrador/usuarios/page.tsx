"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import UserFormModal from "../../components/admin/users/UserFormModal";
import ConfirmModal from "../../components/admin/users/ConfirmModal";
import { getUsers, createUser, updateUser, deleteUser, updateUserStatus } from "../../services/user.service";
import { getRoles } from "../../services/role.service";
import { RoleModel, UserModel } from "../../models/user.model";

const roleStyles: Record<string, { label: string; classes: string }> = {
  administrador: { label: "Administrador", classes: "bg-red-100 text-red-700" },
  ventas: { label: "Ventas", classes: "bg-blue-100 text-blue-700" },
  almacén: { label: "Almacén", classes: "bg-purple-100 text-purple-700" },
  almacen: { label: "Almacén", classes: "bg-purple-100 text-purple-700" },
  repartidor: { label: "Repartidor", classes: "bg-orange-100 text-orange-700" },
};

const statusStyles: Record<string, { label: string; classes: string }> = {
  activo: { label: "Activo", classes: "bg-green-100 text-green-700" },
  inactivo: { label: "Inactivo", classes: "bg-gray-200 text-gray-700" },
};

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

  //const statusLabel = (user: UserModel) => (user.accountStatus  || "activo").toLowerCase();
  const statusLabel = (user: UserModel): "activo" | "inactivo" => {
  if (!user || !user.accountStatus ) return "activo";

  const value = user.accountStatus 
    .toString()
    .trim()
    .toLowerCase();

  return value === "inactivo" ? "inactivo" : "activo";
};

  const renderPagination = () => {
    const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);
    return (
      <div className="flex items-center space-x-2 justify-center mt-6">
        <button
          className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
        >
          «
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 rounded-full border ${
              p === page ? "bg-[#F40009] text-white border-[#F40009]" : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
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
                <h1 className="text-2xl font-semibold text-gray-900">Gestión de Usuarios y Roles</h1>
                <p className="text-gray-500 text-sm">Administra los usuarios, sus roles y estado.</p>
              </div>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 rounded-lg bg-[#F40009] text-white font-semibold shadow hover:bg-red-700"
              >
                Crear Nuevo Usuario
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email/Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-gray-500">
                          Cargando usuarios...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-gray-500">
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
                        //
                        console.log(
  "STATUS CHECK",
  user.id_usuario,
  user.accountStatus ,
  statusKey
);//
                        return (
                          <tr key={user.id_usuario}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fullName(user)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${roleChip.classes}`}>
                                {roleChip.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusChip.classes}`}>
                                {statusChip.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 space-x-4">
                              <button className="text-[#F40009] font-semibold hover:underline" onClick={() => openEditModal(user)}>
                                Editar
                              </button>
                              <button className="text-gray-500 font-semibold hover:underline" onClick={() => openDeleteModal(user)}>
                                Eliminar
                              </button>
                              {isActive ? (
                                <button className="text-gray-700 font-semibold hover:underline" onClick={() => openStatusModal(user)}>
                                  Desactivar
                                </button>
                              ) : (
                                <button className="text-green-600 font-semibold hover:underline" onClick={() => openStatusModal(user)}>
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
            {error && <p className="text-red-600 mt-3">{error}</p>}
          </div>
        </div>
      </div>

      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingUser(null); }}
        roles={roles}
        title={editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
        confirmLabel={editingUser ? "Guardar Cambios" : "Crear Usuario"}
        loading={saving}
        passwordOptional={Boolean(editingUser)}
        initialValues={editingUser ? { fullName: fullName(editingUser), email: editingUser.email, roleId: editingUser.userRoles?.[0]?.id_rol || editingUser.userRoles?.[0]?.role?.id_rol || null } : undefined}
        onSubmit={handleCreateOrUpdate}
      />

      <ConfirmModal
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

      <ConfirmModal
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