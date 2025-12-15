export interface Address {
  id: string;
  label: string;
  addressLine: string;
  extraDetails?: string;
  phone: string;
  isDefault: boolean;
}