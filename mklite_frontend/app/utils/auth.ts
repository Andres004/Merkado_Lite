export type UserLike = {
  rol?: string;
  role?: { nombre?: string } | string;
  userRoles?: Array<{ role?: { nombre?: string } }>;
  [key: string]: any;
};

export const getUserRole = (user: UserLike) => {
  const directRole = typeof user?.rol === 'string' ? user.rol : undefined;
  const roleNameFromRoleField = typeof user?.role === 'string'
    ? user.role
    : typeof user?.role?.nombre === 'string'
      ? user.role.nombre
      : undefined;
  const roleFromRelation = user?.userRoles?.[0]?.role?.nombre;

  const normalized = (directRole || roleNameFromRoleField || roleFromRelation || '')
    .toString()
    .trim()
    .toUpperCase();

  return normalized;
};