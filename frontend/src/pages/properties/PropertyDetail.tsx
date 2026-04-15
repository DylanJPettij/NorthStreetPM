import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { useOwnerData } from '../../hooks/useOwnerData'
import { useDataStore } from '../../store/dataStore'
import { useAuthStore } from '../../store/authStore'
import { allOwners, allLateFeeRules } from '../../data/stubs'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import type { Unit, Charge, ChargeType } from '../../types'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const BATHROOM_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4]

const CHARGE_TYPES: { value: ChargeType; label: string }[] = [
  { value: 'RENT',    label: 'Rent' },
  { value: 'UTILITY', label: 'Utility' },
  { value: 'DAMAGE',  label: 'Damage' },
  { value: 'OTHER',   label: 'Other' },
]

// ─── Unit form ────────────────────────────────────────────────────────────────

const unitSchema = z.object({
  unitNumber:  z.string().min(1, 'Unit number is required'),
  bedrooms:    z.coerce.number().int().min(0).max(20),
  bathrooms:   z.coerce.number().min(1, 'Select bathrooms'),
  rentAmount:  z.coerce.number().min(0, 'Enter a rent amount'),
})
type UnitForm = z.infer<typeof unitSchema>

// ─── Charge form ──────────────────────────────────────────────────────────────

const chargeSchema = z.object({
  chargeType:  z.enum(['RENT', 'UTILITY', 'DAMAGE', 'OTHER']),
  description: z.string().min(1, 'Description is required'),
  amount:      z.coerce.number().min(0.01, 'Amount must be greater than $0'),
  dueDate:     z.string().min(1, 'Due date is required'),
})
type ChargeForm = z.infer<typeof chargeSchema>

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const { properties, units, tenants, tenancies, contractors } = useOwnerData()
  const { addUnit, addCharge } = useDataStore()
  const { user, impersonating } = useAuthStore()
  const effectiveUser = impersonating ?? user
  const navigate = useNavigate()

  const [unitModalOpen, setUnitModalOpen] = useState(false)
  const [chargeModalOpen, setChargeModalOpen] = useState(false)
  const [chargeTargetUnit, setChargeTargetUnit] = useState<Unit | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const unitForm = useForm<UnitForm>({
    resolver: zodResolver(unitSchema),
    defaultValues: { bedrooms: 1, bathrooms: 1, rentAmount: 0 },
  })

  const chargeForm = useForm<ChargeForm>({
    resolver: zodResolver(chargeSchema),
    defaultValues: {
      chargeType: 'RENT',
      dueDate: new Date().toISOString().split('T')[0],
    },
  })

  const property = properties.find((p) => p.id === id)

  if (!property) {
    return (
      <div className="text-center py-16 text-gray-400">
        Property not found.{' '}
        <button className="text-primary-700 underline" onClick={() => navigate('/properties')}>
          Back to properties
        </button>
      </div>
    )
  }

  const owner = allOwners.find((o) => o.id === property.ownerId)
  const propUnits = units.filter((u) => u.propertyId === property.id)
  const occupiedCount = propUnits.filter((u) => u.isOccupied).length
  const lateFeeRule = allLateFeeRules.find((r) => r.propertyId === property.id)
  const propContractors = contractors.filter((c) => c.propertyIds.includes(property.id))
  const propUnitIds = propUnits.map((u) => u.id)
  const activePropTenancies = tenancies.filter(
    (t) => t.status === 'ACTIVE' && propUnitIds.includes(t.unitId),
  )
  const monthlyRevenue = activePropTenancies.reduce((sum, t) => sum + t.monthlyRent, 0)

  const canManage = effectiveUser?.role === 'OWNER' || effectiveUser?.role === 'SUPER ADMIN'

  // ─── Add unit ─────────────────────────────────────────────────────────────

  const onUnitSubmit = (data: UnitForm) => {
    const duplicate = propUnits.some(
      (u) => u.unitNumber.toLowerCase() === data.unitNumber.toLowerCase(),
    )
    if (duplicate) return

    const newUnit: Unit = {
      id: `unit-${Date.now()}`,
      propertyId: property.id,
      unitNumber: data.unitNumber,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      rentAmount: data.rentAmount,
      isOccupied: false,
    }
    addUnit(newUnit)
    unitForm.reset()
    setUnitModalOpen(false)
    setSuccessMsg(`Unit ${newUnit.unitNumber} has been added to ${property.name}.`)
    setTimeout(() => setSuccessMsg(null), 4000)
  }

  // ─── Add charge ───────────────────────────────────────────────────────────

  const openChargeModal = (unit: Unit) => {
    setChargeTargetUnit(unit)
    chargeForm.reset({
      chargeType: 'RENT',
      dueDate: new Date().toISOString().split('T')[0],
    })
    setChargeModalOpen(true)
  }

  const onChargeSubmit = (data: ChargeForm) => {
    const activeTenancy = tenancies.find(
      (t) => t.unitId === chargeTargetUnit?.id && t.status === 'ACTIVE',
    )
    if (!activeTenancy) return

    const newCharge: Charge = {
      id: `charge-${Date.now()}`,
      tenancyId: activeTenancy.id,
      chargeType: data.chargeType,
      description: data.description,
      amount: data.amount,
      dueDate: data.dueDate,
      status: 'UNPAID',
      createdAt: new Date().toISOString(),
    }
    addCharge(newCharge)
    chargeForm.reset()
    setChargeModalOpen(false)
    setChargeTargetUnit(null)
    setSuccessMsg(`Charge added to Unit ${chargeTargetUnit?.unitNumber}.`)
    setTimeout(() => setSuccessMsg(null), 4000)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/properties')}
            className="text-gray-400 hover:text-gray-600 transition-colors mt-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {property.addressLine1}
              {property.addressLine2 ? `, ${property.addressLine2}` : ''},{' '}
              {property.city}, {property.state} {property.zip}
            </p>
            {owner && (
              <p className="text-xs text-gray-400 mt-0.5">
                Owner: {owner.firstName} {owner.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-6 text-center shrink-0">
          <div>
            <p className="text-2xl font-bold text-gray-900">{propUnits.length}</p>
            <p className="text-xs text-gray-500">Total Units</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{occupiedCount}</p>
            <p className="text-xs text-gray-500">Occupied</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-400">{propUnits.length - occupiedCount}</p>
            <p className="text-xs text-gray-500">Vacant</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{usd(monthlyRevenue)}</p>
            <p className="text-xs text-gray-500">Monthly Revenue</p>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
          <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* Late Fee Rule */}
      <Card title="Late Fee Rule">
        {lateFeeRule ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Grace Period</p>
              <p className="font-semibold text-gray-900 mt-0.5">{lateFeeRule.gracePeriodDays} days</p>
            </div>
            <div>
              <p className="text-gray-500">Fee Type</p>
              <p className="font-semibold text-gray-900 mt-0.5">{lateFeeRule.feeType}</p>
            </div>
            <div>
              <p className="text-gray-500">
                {lateFeeRule.feeType === 'FLAT' ? 'Flat Amount' : 'Percentage'}
              </p>
              <p className="font-semibold text-gray-900 mt-0.5">
                {lateFeeRule.feeType === 'FLAT'
                  ? usd(lateFeeRule.flatAmount ?? 0)
                  : `${lateFeeRule.percentage}%`}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Max Fee</p>
              <p className="font-semibold text-gray-900 mt-0.5">{usd(lateFeeRule.maxFeeAmount)}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No late fee rule configured.</p>
        )}
      </Card>

      {/* Units */}
      <Card
        title="Units"
        action={
          canManage ? (
            <Button variant="primary" size="sm" onClick={() => setUnitModalOpen(true)}>
              + Add Unit
            </Button>
          ) : undefined
        }
      >
        {propUnits.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No units yet.{canManage && ' Click "+ Add Unit" to add the first unit.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Unit', 'Beds / Baths', 'Monthly Rent', 'Status', 'Current Tenant', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {propUnits.map((unit) => {
                  const activeTenancy = tenancies.find(
                    (t) => t.unitId === unit.id && t.status === 'ACTIVE',
                  )
                  const currentTenant = activeTenancy
                    ? tenants.find((t) => t.id === activeTenancy.tenantId)
                    : null

                  return (
                    <tr key={unit.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        Unit {unit.unitNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {unit.bedrooms}bd / {unit.bathrooms}ba
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {activeTenancy ? usd(activeTenancy.monthlyRent) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={unit.isOccupied ? 'success' : 'neutral'}>
                          {unit.isOccupied ? 'Occupied' : 'Vacant'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {currentTenant
                          ? `${currentTenant.firstName} ${currentTenant.lastName}`
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {currentTenant && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/tenants/${currentTenant.id}`)}
                            >
                              View Tenant
                            </Button>
                          )}
                          {canManage && activeTenancy && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openChargeModal(unit)}
                            >
                              + Add Charge
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Contractors */}
      <Card title="Contractors">
        {propContractors.length === 0 ? (
          <p className="text-gray-400 text-sm">No contractors assigned to this property.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {propContractors.map((contractor) => (
              <div key={contractor.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {contractor.firstName} {contractor.lastName}
                    {contractor.companyName && (
                      <span className="text-gray-400 ml-1">({contractor.companyName})</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{contractor.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="orange">{contractor.trade}</Badge>
                  <span className="text-sm text-gray-500">{contractor.phone}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Unit Modal */}
      <Modal
        isOpen={unitModalOpen}
        onClose={() => { setUnitModalOpen(false); unitForm.reset() }}
        title="Add Unit"
      >
        <form onSubmit={unitForm.handleSubmit(onUnitSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Number <span className="text-red-500">*</span>
            </label>
            <input
              {...unitForm.register('unitNumber')}
              placeholder="e.g. 1A, 101, B2"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {unitForm.formState.errors.unitNumber && (
              <p className="text-red-500 text-xs mt-1">{unitForm.formState.errors.unitNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms <span className="text-red-500">*</span>
              </label>
              <input
                {...unitForm.register('bedrooms')}
                type="number"
                min={0}
                max={20}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {unitForm.formState.errors.bedrooms && (
                <p className="text-red-500 text-xs mt-1">{unitForm.formState.errors.bedrooms.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms <span className="text-red-500">*</span>
              </label>
              <select
                {...unitForm.register('bathrooms')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {BATHROOM_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {unitForm.formState.errors.bathrooms && (
                <p className="text-red-500 text-xs mt-1">{unitForm.formState.errors.bathrooms.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rent / mo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  {...unitForm.register('rentAmount')}
                  type="number"
                  min={0}
                  step={50}
                  className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {unitForm.formState.errors.rentAmount && (
                <p className="text-red-500 text-xs mt-1">{unitForm.formState.errors.rentAmount.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            New units are added as <span className="font-medium text-gray-700 ml-1">Vacant</span>. Link a tenant to mark as occupied.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setUnitModalOpen(false); unitForm.reset() }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={unitForm.formState.isSubmitting}>
              Add Unit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Charge Modal */}
      <Modal
        isOpen={chargeModalOpen}
        onClose={() => { setChargeModalOpen(false); chargeForm.reset(); setChargeTargetUnit(null) }}
        title={`Add Charge — Unit ${chargeTargetUnit?.unitNumber ?? ''}`}
      >
        <form onSubmit={chargeForm.handleSubmit(onChargeSubmit)} className="space-y-4">

          {/* Charge Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Charge Type <span className="text-red-500">*</span>
            </label>
            <select
              {...chargeForm.register('chargeType')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {CHARGE_TYPES.map((ct) => (
                <option key={ct.value} value={ct.value}>{ct.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              {...chargeForm.register('description')}
              placeholder="e.g. Rent — May 2026"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {chargeForm.formState.errors.description && (
              <p className="text-red-500 text-xs mt-1">{chargeForm.formState.errors.description.message}</p>
            )}
          </div>

          {/* Amount + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  {...chargeForm.register('amount')}
                  type="number"
                  min={0}
                  step={0.01}
                  className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {chargeForm.formState.errors.amount && (
                <p className="text-red-500 text-xs mt-1">{chargeForm.formState.errors.amount.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                {...chargeForm.register('dueDate')}
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {chargeForm.formState.errors.dueDate && (
                <p className="text-red-500 text-xs mt-1">{chargeForm.formState.errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setChargeModalOpen(false); chargeForm.reset(); setChargeTargetUnit(null) }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={chargeForm.formState.isSubmitting}>
              Add Charge
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
