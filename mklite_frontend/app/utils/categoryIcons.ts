+22
-0

import { LucideIcon, Carrot, Utensils, Drumstick, Wheat, BottleWine, Popcorn, Milk, Home, Droplet, Baby, Snowflake, PawPrint, ShoppingBag } from 'lucide-react';
import { slugify } from './slugify';

const iconEntries: Record<string, LucideIcon> = {
  'frutas-y-verduras': Carrot,
  'fiambres-y-embutidos': Utensils,
  carnes: Drumstick,
  panaderia: Wheat,
  bebidas: BottleWine,
  snacks: Popcorn,
  lacteos: Milk,
  'cuidado-del-hogar': Home,
  'cuidado-personal': Droplet,
  'cuidado-del-bebe': Baby,
  congelados: Snowflake,
  mascotas: PawPrint,
};

export const getCategoryIcon = (categoryName: string): LucideIcon => {
  const key = slugify(categoryName);
  return iconEntries[key] ?? ShoppingBag;
};