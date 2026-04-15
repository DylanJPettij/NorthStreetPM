import type {
  Owner,
  Tenant,
  Contractor,
  Property,
  Unit,
  Tenancy,
  Charge,
  Payment,
  LateFeeRule,
  User,
  PaymentMethod,
} from "../types";

// ─── OWNERS ───────────────────────────────────────────────────────────────────

export const owner1: Owner = {
  id: "owner1",
  email: "james@millerproperties.com",
  firstName: "James",
  lastName: "Miller",
  role: "OWNER",
  isActive: true,
  createdAt: "2023-01-10T00:00:00Z",
  companyName: "Miller Properties",
  phone: "555-0101",
};

export const owner2: Owner = {
  id: "owner2",
  email: "sarah@chenliving.com",
  firstName: "Sarah",
  lastName: "Chen",
  role: "OWNER",
  isActive: true,
  createdAt: "2023-03-15T00:00:00Z",
  companyName: "Chen Living",
  phone: "555-0102",
};

// ─── SUPER ADMIN ──────────────────────────────────────────────────────────────

export const superAdmin: User = {
  id: "superadmin1",
  email: "admin@internal.com",
  firstName: "Admin",
  lastName: "User",
  role: "SUPER ADMIN",
  isActive: true,
  createdAt: "2022-06-01T00:00:00Z",
};

// ─── TENANTS ──────────────────────────────────────────────────────────────────

export const tenant1: Tenant = {
  id: "tenant1",
  email: "marcus@email.com",
  firstName: "Marcus",
  lastName: "Johnson",
  role: "TENANT",
  isActive: true,
  createdAt: "2023-12-15T00:00:00Z",
  phone: "555-0201",
  ownerId: "owner1",
  registrationStatus: "REGISTERED",
  invitedAt: "2023-12-10T09:00:00Z",
};

export const tenant2: Tenant = {
  id: "tenant2",
  email: "priya@email.com",
  firstName: "Priya",
  lastName: "Patel",
  role: "TENANT",
  isActive: true,
  createdAt: "2024-05-20T00:00:00Z",
  phone: "555-0202",
  ownerId: "owner1",
  registrationStatus: "REGISTERED",
  invitedAt: "2024-05-15T14:30:00Z",
};

export const tenant3: Tenant = {
  id: "tenant3",
  email: "carlos@email.com",
  firstName: "Carlos",
  lastName: "Rivera",
  role: "TENANT",
  isActive: true,
  createdAt: "2023-08-10T00:00:00Z",
  phone: "555-0203",
  ownerId: "owner2",
  registrationStatus: "REGISTERED",
  invitedAt: "2023-08-05T10:00:00Z",
};

export const tenant4: Tenant = {
  id: "tenant4",
  email: "emily@email.com",
  firstName: "Emily",
  lastName: "Watson",
  role: "TENANT",
  isActive: true,
  createdAt: "2025-02-20T00:00:00Z",
  phone: "555-0204",
  ownerId: "owner1",
  registrationStatus: "PENDING",
  invitedAt: "2025-02-18T08:00:00Z",
};

// ─── CONTRACTORS ──────────────────────────────────────────────────────────────

export const contractor1: Contractor = {
  id: "contractor1",
  email: "bob@bobsplumbing.com",
  firstName: "Bob",
  lastName: "Smith",
  role: "CONTRACTOR",
  isActive: true,
  createdAt: "2023-02-01T00:00:00Z",
  phone: "555-0301",
  companyName: "Bob's Plumbing",
  trade: "Plumbing",
  ownerId: "owner1",
  propertyIds: ["property1", "property2"],
};

export const contractor2: Contractor = {
  id: "contractor2",
  email: "linda@coolair.com",
  firstName: "Linda",
  lastName: "Torres",
  role: "CONTRACTOR",
  isActive: true,
  createdAt: "2023-04-15T00:00:00Z",
  phone: "555-0302",
  companyName: "CoolAir HVAC",
  trade: "HVAC",
  ownerId: "owner1",
  propertyIds: ["property1"],
};

// ─── PROPERTIES ───────────────────────────────────────────────────────────────

export const property1: Property = {
  id: "property1",
  ownerId: "owner1",
  name: "Maplewood Apartments",
  addressLine1: "142 Maplewood Dr",
  city: "Nashville",
  state: "TN",
  zip: "37201",
  createdAt: "2023-01-15T00:00:00Z",
};

export const property2: Property = {
  id: "property2",
  ownerId: "owner1",
  name: "Riverside Condos",
  addressLine1: "88 River Bend Rd",
  city: "Nashville",
  state: "TN",
  zip: "37205",
  createdAt: "2023-06-01T00:00:00Z",
};

export const property3: Property = {
  id: "property3",
  ownerId: "owner2",
  name: "Chen Flats",
  addressLine1: "500 Oak Street",
  city: "Austin",
  state: "TX",
  zip: "78701",
  createdAt: "2023-03-20T00:00:00Z",
};

// ─── UNITS ────────────────────────────────────────────────────────────────────

export const unit1A: Unit = {
  id: "unit1A",
  propertyId: "property1",
  unitNumber: "1A",
  bedrooms: 2,
  bathrooms: 1,
  rentAmount: 1200,
  isOccupied: true,
};

export const unit1B: Unit = {
  id: "unit1B",
  propertyId: "property1",
  unitNumber: "1B",
  bedrooms: 1,
  bathrooms: 1,
  rentAmount: 950,
  isOccupied: true,
};

export const unit2A: Unit = {
  id: "unit2A",
  propertyId: "property1",
  unitNumber: "2A",
  bedrooms: 3,
  bathrooms: 2,
  rentAmount: 1650,
  isOccupied: false,
};

export const unit101: Unit = {
  id: "unit101",
  propertyId: "property2",
  unitNumber: "101",
  bedrooms: 2,
  bathrooms: 2,
  rentAmount: 1400,
  isOccupied: true,
};

export const unit102: Unit = {
  id: "unit102",
  propertyId: "property2",
  unitNumber: "102",
  bedrooms: 2,
  bathrooms: 2,
  rentAmount: 1400,
  isOccupied: false,
};

export const unitA: Unit = {
  id: "unitA",
  propertyId: "property3",
  unitNumber: "A",
  bedrooms: 1,
  bathrooms: 1,
  rentAmount: 1100,
  isOccupied: true,
};

// ─── TENANCIES ────────────────────────────────────────────────────────────────

export const tenancy1: Tenancy = {
  id: "tenancy1",
  tenantId: "tenant1",
  unitId: "unit1A",
  startDate: "2024-01-01",
  endDate: "2026-12-31",
  monthlyRent: 1200,
  status: "ACTIVE",
  leaseType: "FIXED",
};

export const tenancy2: Tenancy = {
  id: "tenancy2",
  tenantId: "tenant2",
  unitId: "unit1B",
  startDate: "2024-06-01",
  endDate: "2026-06-30", // expiring in ~81 days from Apr 10 2026
  monthlyRent: 950,
  status: "ACTIVE",
  leaseType: "FIXED",
};

export const tenancy3: Tenancy = {
  id: "tenancy3",
  tenantId: "tenant3",
  unitId: "unitA",
  startDate: "2023-09-01",
  monthlyRent: 1100,
  status: "ACTIVE",
  leaseType: "MONTH TO MONTH",
};

export const tenancy4: Tenancy = {
  id: "tenancy4",
  tenantId: "tenant4",
  unitId: "unit101",
  startDate: "2025-03-01",
  endDate: "2026-05-31", // expiring in ~51 days from Apr 10 2026
  monthlyRent: 1400,
  status: "ACTIVE",
  leaseType: "FIXED",
};

export const tenancy5: Tenancy = {
  id: "tenancy5",
  tenantId: "tenant4",
  unitId: "unit1A",
  startDate: "2023-01-01",
  endDate: "2023-12-31",
  monthlyRent: 1200,
  status: "ENDED",
  leaseType: "FIXED",
};

// ─── CHARGES ──────────────────────────────────────────────────────────────────

// Marcus (tenant1) — tenancy1
export const charge_t1_apr_rent: Charge = {
  id: "charge-t1-apr-rent",
  tenancyId: "tenancy1",
  chargeType: "RENT",
  description: "Rent — April 2026",
  amount: 1200,
  dueDate: "2026-04-01",
  status: "PAID",
  createdAt: "2026-04-01T00:00:00Z",
};

export const charge_t1_mar_rent: Charge = {
  id: "charge-t1-mar-rent",
  tenancyId: "tenancy1",
  chargeType: "RENT",
  description: "Rent — March 2026",
  amount: 1200,
  dueDate: "2026-03-01",
  status: "PAID",
  createdAt: "2026-03-01T00:00:00Z",
};

// Priya (tenant2) — tenancy2
export const charge_t2_apr_rent: Charge = {
  id: "charge-t2-apr-rent",
  tenancyId: "tenancy2",
  chargeType: "RENT",
  description: "Rent — April 2026",
  amount: 950,
  dueDate: "2026-04-01",
  status: "UNPAID",
  createdAt: "2026-04-01T00:00:00Z",
};

export const charge_t2_mar_rent: Charge = {
  id: "charge-t2-mar-rent",
  tenancyId: "tenancy2",
  chargeType: "RENT",
  description: "Rent — March 2026",
  amount: 950,
  dueDate: "2026-03-01",
  status: "PAID",
  createdAt: "2026-03-01T00:00:00Z",
};

export const charge_t2_late_fee: Charge = {
  id: "charge-t2-late-fee",
  tenancyId: "tenancy2",
  chargeType: "LATE FEE",
  description: "Late Fee — April 2026 rent",
  amount: 75,
  dueDate: "2026-04-06",
  status: "UNPAID",
  parentChargeId: "charge-t2-apr-rent",
  createdAt: "2026-04-06T00:00:00Z",
};

// Carlos (tenant3) — tenancy3
export const charge_t3_apr_rent: Charge = {
  id: "charge-t3-apr-rent",
  tenancyId: "tenancy3",
  chargeType: "RENT",
  description: "Rent — April 2026",
  amount: 1100,
  dueDate: "2026-04-01",
  status: "PAID",
  createdAt: "2026-04-01T00:00:00Z",
};

// Emily (tenant4) — tenancy4
export const charge_t4_apr_rent: Charge = {
  id: "charge-t4-apr-rent",
  tenancyId: "tenancy4",
  chargeType: "RENT",
  description: "Rent — April 2026",
  amount: 1400,
  dueDate: "2026-04-01",
  status: "UNPAID",
  createdAt: "2026-04-01T00:00:00Z",
};

export const charge_t4_parking: Charge = {
  id: "charge-t4-parking",
  tenancyId: "tenancy4",
  chargeType: "OTHER",
  description: "Parking spot — April",
  amount: 75,
  dueDate: "2026-04-01",
  status: "UNPAID",
  createdAt: "2026-04-01T00:00:00Z",
};

export const charge_t4_damage: Charge = {
  id: "charge-t4-damage",
  tenancyId: "tenancy4",
  chargeType: "DAMAGE",
  description: "Broken window repair",
  amount: 220,
  dueDate: "2026-04-15",
  status: "UNPAID",
  createdAt: "2026-04-05T00:00:00Z",
};

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────

export const payment1: Payment = {
  id: "payment1",
  chargeId: "charge-t1-apr-rent",
  amountPaid: 1200,
  paidAt: "2026-04-02T10:30:00Z",
  method: "ACH",
};

export const payment2: Payment = {
  id: "payment2",
  chargeId: "charge-t1-mar-rent",
  amountPaid: 1200,
  paidAt: "2026-03-02T09:15:00Z",
  method: "ACH",
};

export const payment3: Payment = {
  id: "payment3",
  chargeId: "charge-t2-mar-rent",
  amountPaid: 950,
  paidAt: "2026-03-03T11:00:00Z",
  method: "CARD",
};

export const payment4: Payment = {
  id: "payment4",
  chargeId: "charge-t3-apr-rent",
  amountPaid: 1100,
  paidAt: "2026-04-01T14:22:00Z",
  method: "ACH",
};

// ─── LATE FEE RULES ───────────────────────────────────────────────────────────

export const lateFeeRule1: LateFeeRule = {
  id: "lfr1",
  propertyId: "property1",
  gracePeriodDays: 5,
  feeType: "FLAT",
  flatAmount: 75,
  maxFeeAmount: 75,
};

export const lateFeeRule2: LateFeeRule = {
  id: "lfr2",
  propertyId: "property2",
  gracePeriodDays: 3,
  feeType: "PERCENTAGE",
  percentage: 5,
  maxFeeAmount: 70,
};

export const lateFeeRule3: LateFeeRule = {
  id: "lfr3",
  propertyId: "property3",
  gracePeriodDays: 5,
  feeType: "FLAT",
  flatAmount: 50,
  maxFeeAmount: 50,
};

// ─── HISTORICAL RENT DATA (12 months) ─────────────────────────────────────────

function makeRentMonth(
  tenancyId: string,
  rent: number,
  year: number,
  month: number,
  method: PaymentMethod = "ACH",
): { charge: Charge; payment: Payment } {
  const mm = String(month).padStart(2, "0");
  const label = new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "long",
  });
  const chargeId = `${tenancyId}-r${year}${mm}`;
  return {
    charge: {
      id: chargeId,
      tenancyId,
      chargeType: "RENT",
      description: `Rent — ${label} ${year}`,
      amount: rent,
      dueDate: `${year}-${mm}-01`,
      status: "PAID",
      createdAt: `${year}-${mm}-01T00:00:00Z`,
    },
    payment: {
      id: `pay-${tenancyId}-${year}${mm}`,
      chargeId,
      amountPaid: rent,
      paidAt: `${year}-${mm}-02T10:00:00Z`,
      method,
    },
  };
}

// May 2025 – Feb 2026 (10 months); March 2026 already covered for t1/t2; add it for t4
const _histMonths: [number, number][] = [
  [2025, 5],
  [2025, 6],
  [2025, 7],
  [2025, 8],
  [2025, 9],
  [2025, 10],
  [2025, 11],
  [2025, 12],
  [2026, 1],
  [2026, 2],
];

const _hist = [
  ..._histMonths.map(([y, m]) => makeRentMonth("tenancy1", 1200, y, m)),
  ..._histMonths.map(([y, m]) => makeRentMonth("tenancy2", 950, y, m, "CARD")),
  ..._histMonths.map(([y, m]) => makeRentMonth("tenancy4", 1400, y, m)),
  makeRentMonth("tenancy4", 1400, 2026, 3), // March 2026 for Emily
  ..._histMonths.map(([y, m]) => makeRentMonth("tenancy3", 1100, y, m)),
];

const _histCharges: Charge[] = _hist.map((h) => h.charge);
const _histPayments: Payment[] = _hist.map((h) => h.payment);

// ─── COLLECTIONS ──────────────────────────────────────────────────────────────

export const allOwners: Owner[] = [owner1, owner2];

export const allTenants: Tenant[] = [tenant1, tenant2, tenant3, tenant4];

export const allContractors: Contractor[] = [contractor1, contractor2];

export const allProperties: Property[] = [property1, property2, property3];

export const allUnits: Unit[] = [
  unit1A,
  unit1B,
  unit2A,
  unit101,
  unit102,
  unitA,
];

export const allTenancies: Tenancy[] = [
  tenancy1,
  tenancy2,
  tenancy3,
  tenancy4,
  tenancy5,
];

export const allCharges: Charge[] = [
  charge_t1_apr_rent,
  charge_t1_mar_rent,
  charge_t2_apr_rent,
  charge_t2_mar_rent,
  charge_t2_late_fee,
  charge_t3_apr_rent,
  charge_t4_apr_rent,
  charge_t4_parking,
  charge_t4_damage,
  ..._histCharges,
];

export const allPayments: Payment[] = [
  payment1,
  payment2,
  payment3,
  payment4,
  ..._histPayments,
];

export const allLateFeeRules: LateFeeRule[] = [
  lateFeeRule1,
  lateFeeRule2,
  lateFeeRule3,
];

export const allUsers: User[] = [
  superAdmin,
  owner1,
  owner2,
  tenant1,
  tenant2,
  tenant3,
  tenant4,
  contractor1,
  contractor2,
];

// ─── STUB ACCOUNTS ────────────────────────────────────────────────────────────

export const stubAccounts = [
  { user: superAdmin, token: "stub-token-superadmin", label: "Super Admin" },
  { user: owner1, token: "stub-token-owner1", label: "Owner — James Miller" },
  { user: owner2, token: "stub-token-owner2", label: "Owner — Sarah Chen" },
  {
    user: tenant1,
    token: "stub-token-tenant1",
    label: "Tenant — Marcus Johnson",
  },
  { user: tenant2, token: "stub-token-tenant2", label: "Tenant — Priya Patel" },
  {
    user: tenant3,
    token: "stub-token-tenant3",
    label: "Tenant — Carlos Rivera",
  },
  {
    user: contractor1,
    token: "stub-token-contractor1",
    label: "Contractor — Bob Smith",
  },
];
