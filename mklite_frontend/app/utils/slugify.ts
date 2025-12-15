export const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

export const matchCategoryBySlug = <T extends { nombre: string; id_categoria: number }>(
  categories: T[],
  slugOrId: string,
) => {
  const numericId = Number(slugOrId);
  if (!Number.isNaN(numericId)) {
    return categories.find((category) => category.id_categoria === numericId) || null;
  }

  const normalizedSlug = slugify(slugOrId);
  return categories.find((category) => slugify(category.nombre) === normalizedSlug) || null;
};