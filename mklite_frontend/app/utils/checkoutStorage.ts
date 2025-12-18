'use client';

import { CreateOrderPayload } from "../services/order.service";

export type PaymentMethod = 'efectivo' | 'qr' | 'tarjeta';
export type PaymentStatus = 'pending' | 'verified';

export interface PendingCheckoutState {
  orderPayload: CreateOrderPayload;
  cartId: number;
  cartItems: any[];
  summary: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  user?: {
    id_usuario: number;
    nombre?: string;
    apellido?: string;
    email?: string;
  };
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
}

export interface ConfirmationState {
  orderId: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  canInvoice: boolean;
  userEmail?: string;
  summary?: PendingCheckoutState['summary'];
  deliveryMethod?: string;
}

const PENDING_KEY = 'pendingCheckoutState';
const CONFIRMATION_KEY = 'lastOrderConfirmation';

const hasWindow = () => typeof window !== 'undefined';

export const savePendingCheckout = (data: PendingCheckoutState) => {
  if (!hasWindow()) return;
  localStorage.setItem(PENDING_KEY, JSON.stringify(data));
};

export const updatePendingCheckout = (updater: (prev: PendingCheckoutState) => PendingCheckoutState) => {
  const current = getPendingCheckout();
  if (!current) return;
  const next = updater(current);
  savePendingCheckout(next);
};

export const getPendingCheckout = (): PendingCheckoutState | null => {
  if (!hasWindow()) return null;
  const raw = localStorage.getItem(PENDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingCheckoutState;
  } catch (error) {
    console.error('Error leyendo pending checkout', error);
    return null;
  }
};

export const clearPendingCheckout = () => {
  if (!hasWindow()) return;
  localStorage.removeItem(PENDING_KEY);
};

export const saveConfirmationState = (data: ConfirmationState) => {
  if (!hasWindow()) return;
  localStorage.setItem(CONFIRMATION_KEY, JSON.stringify(data));
};

export const getConfirmationState = (): ConfirmationState | null => {
  if (!hasWindow()) return null;
  const raw = localStorage.getItem(CONFIRMATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ConfirmationState;
  } catch (error) {
    console.error('Error leyendo confirmación', error);
    return null;
  }
};

export const clearConfirmationState = () => {
  if (!hasWindow()) return;
  localStorage.removeItem(CONFIRMATION_KEY);
};