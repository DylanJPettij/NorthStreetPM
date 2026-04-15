import { useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import { useDataStore } from '../store/dataStore'
import {
  allProperties,
  allUnits,
  allTenants,
  allTenancies,
  allCharges,
  allPayments,
  allContractors,
} from '../data/stubs'
import type { Property, Unit, Tenant, Tenancy, Charge, Payment, Contractor } from '../types'

interface OwnerData {
  properties: Property[]
  units: Unit[]
  tenants: Tenant[]
  tenancies: Tenancy[]
  charges: Charge[]
  payments: Payment[]
  contractors: Contractor[]
}

/**
 * Returns all stub data merged with runtime data, filtered to the current owner.
 * Super admins see everything.
 */
export function useOwnerData(): OwnerData {
  const { user, impersonating } = useAuthStore()
  const effectiveUser = impersonating ?? user
  const {
    addedProperties,
    addedTenants,
    addedUnits,
    addedTenancies,
    addedCharges,
    addedPayments,
    unitOccupancyOverrides,
    chargeStatusOverrides,
  } = useDataStore()

  return useMemo(() => {
    if (!effectiveUser) {
      return {
        properties: [],
        units: [],
        tenants: [],
        tenancies: [],
        charges: [],
        payments: [],
        contractors: [],
      }
    }

    // Merge stub data with runtime-added data
    const mergedProperties = [...allProperties, ...addedProperties]
    const mergedTenants = [...allTenants, ...addedTenants]
    const mergedUnitsRaw = [...allUnits, ...addedUnits]
    const mergedTenancies = [...allTenancies, ...addedTenancies]
    const mergedChargesRaw = [...allCharges, ...addedCharges]
    const mergedPayments = [...allPayments, ...addedPayments]

    // Apply occupancy overrides
    const mergedUnits = mergedUnitsRaw.map((u) =>
      u.id in unitOccupancyOverrides ? { ...u, isOccupied: unitOccupancyOverrides[u.id] } : u,
    )

    // Apply charge status overrides (e.g. tenant payments)
    const mergedCharges = mergedChargesRaw.map((c) =>
      c.id in chargeStatusOverrides ? { ...c, status: chargeStatusOverrides[c.id] } : c,
    )

    // Super admin sees all
    if (effectiveUser.role === 'SUPER ADMIN') {
      return {
        properties: mergedProperties,
        units: mergedUnits,
        tenants: mergedTenants,
        tenancies: mergedTenancies,
        charges: mergedCharges,
        payments: mergedPayments,
        contractors: allContractors,
      }
    }

    // Filter by owner
    const ownerId = effectiveUser.id
    const properties = mergedProperties.filter((p) => p.ownerId === ownerId)
    const propertyIds = properties.map((p) => p.id)
    const units = mergedUnits.filter((u) => propertyIds.includes(u.propertyId))
    const unitIds = units.map((u) => u.id)
    const tenants = mergedTenants.filter((t) => t.ownerId === ownerId)
    const tenancies = mergedTenancies.filter((t) => unitIds.includes(t.unitId))
    const tenancyIds = tenancies.map((t) => t.id)
    const charges = mergedCharges.filter((c) => tenancyIds.includes(c.tenancyId))
    const chargeIds = charges.map((c) => c.id)
    const payments = mergedPayments.filter((p) => chargeIds.includes(p.chargeId))
    const contractors = allContractors.filter((c) => c.ownerId === ownerId)

    return { properties, units, tenants, tenancies, charges, payments, contractors }
  }, [
    effectiveUser,
    addedProperties,
    addedTenants,
    addedUnits,
    addedTenancies,
    addedCharges,
    addedPayments,
    unitOccupancyOverrides,
    chargeStatusOverrides,
  ])
}
