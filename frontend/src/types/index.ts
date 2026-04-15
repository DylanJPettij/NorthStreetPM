export type Role = "SUPER ADMIN" | "OWNER" | "TENANT" | "CONTRACTOR";

export type ChargeType = "RENT" | "LATE FEE" | "UTILITY" | "DAMAGE" | "OTHER";
export type ChargeStatus = "UNPAID" | "PAID" | "DELETED" | "WAIVED" | "DISPUTE";
export type TenancyStatus = "ACTIVE" | "ENDED" | "EVICTED";
export type PaymentMethod = "ACH" | "CARD" | "MANUAL";
export type FeeType = "FLAT" | "PERCENTAGE";
export type LeaseType = "FIXED" | "MONTH TO MONTH";

/**
 * INVITED  — invite email sent, tenant hasn't clicked the link yet
 * PENDING  — tenant clicked the link and started but hasn't finished setup
 * REGISTERED — account fully set up and active
 */
export type RegistrationStatus = "INVITED" | "PENDING" | "REGISTERED";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface Owner extends User {
  companyName?: string;
  phone: string;
  stripeCustomerId?: string;
}

export interface Tenant extends User {
  phone: string;
  ownerId: string;
  stripeCustomerId?: string;
  registrationStatus: RegistrationStatus;
  invitedAt: string;
}

export interface Contractor extends User {
  phone: string;
  companyName?: string;
  trade: string;
  ownerId: string;
  propertyIds: string[];
}

export interface Property {
  id: string;
  ownerId: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  createdAt: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  isOccupied: boolean;
}

export interface Tenancy {
  id: string;
  tenantId: string;
  unitId: string;
  startDate: string;
  endDate?: string;
  monthlyRent: number;
  status: TenancyStatus;
  leaseType: LeaseType;
}

export interface Charge {
  id: string;
  tenancyId: string;
  chargeType: ChargeType;
  description: string;
  amount: number;
  dueDate: string;
  status: ChargeStatus;
  parentChargeId?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  chargeId: string;
  amountPaid: number;
  paidAt: string;
  method: PaymentMethod;
  stripePaymentIntentId?: string;
}

export interface LateFeeRule {
  id: string;
  propertyId: string;
  gracePeriodDays: number;
  feeType: FeeType;
  flatAmount?: number;
  percentage?: number;
  maxFeeAmount: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  impersonating: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  impersonate: (user: User) => void;
  stopImpersonating: () => void;
}
