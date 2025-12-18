export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '');

const extractNumericId = (value: string) => {
  const [rawId] = value.split('-');
  const numericId = Number(rawId);
  return Number.isNaN(numericId) ? null : numericId;
};

export const matchCategoryBySlug = <T extends { nombre: string; id_categoria: number }>(
  categories: T[],
  slugOrId: string,
) => {
  const numericId = extractNumericId(slugOrId);
  if (numericId !== null) {
    const foundById = categories.find((category) => category.id_categoria === numericId);
    if (foundById) {
      return foundById;
    }
  }

  const normalizedSlug = slugify(slugOrId);
  return categories.find((category) => slugify(category.nombre) === normalizedSlug) || null;
};