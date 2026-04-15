import { create } from 'zustand'
import type { Property, Tenant, Unit, Tenancy, Charge, Payment, ChargeStatus } from '../types'

/**
 * In-memory store for data created at runtime (not yet backed by an API).
 * Survives page navigation within a session but resets on full page reload.
 */
interface DataStore {
  addedProperties: Property[]
  addedTenants: Tenant[]
  addedUnits: Unit[]
  addedTenancies: Tenancy[]
  addedCharges: Charge[]
  addedPayments: Payment[]
  unitOccupancyOverrides: Record<string, boolean>
  chargeStatusOverrides: Record<string, ChargeStatus>
  addProperty: (property: Property) => void
  addTenant: (tenant: Tenant) => void
  addUnit: (unit: Unit) => void
  addTenancy: (tenancy: Tenancy) => void
  addCharge: (charge: Charge) => void
  addPayment: (payment: Payment) => void
  setUnitOccupied: (unitId: string, occupied: boolean) => void
  setChargeStatus: (chargeId: string, status: ChargeStatus) => void
}

export const useDataStore = create<DataStore>((set) => ({
  addedProperties: [],
  addedTenants: [],
  addedUnits: [],
  addedTenancies: [],
  addedCharges: [],
  addedPayments: [],
  unitOccupancyOverrides: {},
  chargeStatusOverrides: {},

  addProperty: (property) =>
    set((state) => ({ addedProperties: [...state.addedProperties, property] })),

  addTenant: (tenant) =>
    set((state) => ({ addedTenants: [...state.addedTenants, tenant] })),

  addUnit: (unit) =>
    set((state) => ({ addedUnits: [...state.addedUnits, unit] })),

  addTenancy: (tenancy) =>
    set((state) => ({ addedTenancies: [...state.addedTenancies, tenancy] })),

  addCharge: (charge) =>
    set((state) => ({ addedCharges: [...state.addedCharges, charge] })),

  addPayment: (payment) =>
    set((state) => ({ addedPayments: [...state.addedPayments, payment] })),

  setUnitOccupied: (unitId, occupied) =>
    set((state) => ({
      unitOccupancyOverrides: { ...state.unitOccupancyOverrides, [unitId]: occupied },
    })),

  setChargeStatus: (chargeId, status) =>
    set((state) => ({
      chargeStatusOverrides: { ...state.chargeStatusOverrides, [chargeId]: status },
    })),
}))
