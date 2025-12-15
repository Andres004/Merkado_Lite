'use client';

import { ReactNode } from 'react';
import { FavoriteProvider } from './context/FavoriteContext';

const Providers = ({ children }: { children: ReactNode }) => {
  return <FavoriteProvider>{children}</FavoriteProvider>;
};

export default Providers;