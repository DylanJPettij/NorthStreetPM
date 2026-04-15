import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { useOwnerData } from '../../hooks/useOwnerData'
import {
  allUnits,
  allProperties,
  allTenancies,
  allPayments,
} from '../../data/stubs'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { mergeLateFees } from '../../utils/charges'
import type { ChargeStatus, ChargeType, PaymentMethod } from '../../types'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

function chargeStatusVariant(status: ChargeStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'PAID': return 'success'
    case 'UNPAID': return 'warning'
    case 'WAIVED':   return 'neutral'
    case 'DELETED':  return 'neutral'
    case 'DISPUTE':  return 'danger'
  }
}

function chargeTypeVariant(type: ChargeType): 'info' | 'danger' | 'teal' | 'neutral' | 'warning' {
  switch (type) {
    case 'RENT': return 'info'
    case 'LATE FEE': return 'danger'
    case 'UTILITY': return 'teal'
    case 'DAMAGE': return 'warning'
    case 'OTHER': return 'neutral'
  }
}

function methodVariant(method: PaymentMethod): 'info' | 'teal' | 'neutral' {
  switch (method) {
    case 'ACH': return 'info'
    case 'CARD': return 'teal'
    case 'MANUAL': return 'neutral'
  }
}

const addChargeSchema = z.object({
  chargeType: z.enum(['RENT', 'LATE FEE', 'UTILITY', 'DAMAGE', 'OTHER']),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
})
type AddChargeForm = z.infer<typeof addChargeSchema>

export default function TenantDetail() {
  const { id } = useParams<{ id: string }>()
  const { tenants, charges } = useOwnerData()
  const navigate = useNavigate()

  const [showAddCharge, setShowAddCharge] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const tenant = tenants.find((t) => t.id === id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddChargeForm>({
    resolver: zodResolver(addChargeSchema),
    defaultValues: { chargeType: 'RENT', description: '', amount: 0, dueDate: '' },
  })

  if (!tenant) {
    return (
      <div className="text-center py-16 text-gray-400">
        Tenant not found.{' '}
        <button
          className="text-primary-700 underline"
          onClick={() => navigate('/tenants')}
        >
          Back to tenants
        </button>
      </div>
    )
  }

  // Find tenancies — show most recent active first
  const tenantTenancies = allTenancies
    .filter((t) => t.tenantId === tenant.id)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

  const activeTenancy = tenantTenancies.find((t) => t.status === 'ACTIVE')
  const unit = activeTenancy ? allUnits.find((u) => u.id === activeTenancy.unitId) : null
  const property = unit ? allProperties.find((p) => p.id === unit.propertyId) : null

  // Charges for all this tenant's tenancies
  const tenantTenancyIds = tenantTenancies.map((t) => t.id)
  const tenantCharges = mergeLateFees(charges.filter((c) => tenantTenancyIds.includes(c.tenancyId)))
  const chargeIds = tenantCharges.map((c) => c.id)
  const tenantPayments = allPayments.filter((p) => chargeIds.includes(p.chargeId))

  const outstandingBalance = tenantCharges
    .filter((c) => c.status === 'UNPAID')
    .reduce((sum, c) => sum + c.amount, 0)

  const onSubmitCharge = (_data: AddChargeForm) => {
    setShowAddCharge(false)
    reset()
    setSuccessMsg('Charge added successfully (stub — no API call made).')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tenants')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {tenant.firstName} {tenant.lastName}
              </h1>
              <Badge variant="teal">TENANT</Badge>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">{tenant.email} · {tenant.phone}</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => setShowAddCharge(true)}>
          + Add Charge
        </Button>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
          {successMsg}
        </div>
      )}

      {/* Outstanding balance */}
      <div
        className={`rounded-xl p-5 ${outstandingBalance > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}
      >
        <p className="text-sm text-gray-500">Outstanding Balance</p>
        <p
          className={`text-3xl font-bold mt-1 ${outstandingBalance > 0 ? 'text-red-700' : 'text-green-700'}`}
        >
          {usd(outstandingBalance)}
        </p>
      </div>

      {/* Current Tenancy */}
      {activeTenancy && unit && property && (
        <Card title="Current Tenancy">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Property</p>
              <p className="font-medium text-gray-900 mt-0.5">{property.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Unit</p>
              <p className="font-medium text-gray-900 mt-0.5">Unit {unit.unitNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Start Date</p>
              <p className="font-medium text-gray-900 mt-0.5">
                {format(new Date(activeTenancy.startDate), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Monthly Rent</p>
              <p className="font-medium text-gray-900 mt-0.5">{usd(activeTenancy.monthlyRent)}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <div className="mt-0.5">
                <Badge variant="success">{activeTenancy.status}</Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Charges */}
      <Card title="Charges">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Type', 'Description', 'Amount', 'Due Date', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {tenantCharges.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">
                    No charges found.
                  </td>
                </tr>
              ) : (
                tenantCharges.map((charge) => (
                  <tr key={charge.id} className="hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3">
                      <Badge variant={chargeTypeVariant(charge.chargeType)}>
                        {charge.chargeType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{charge.description}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{usd(charge.amount)}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {format(new Date(charge.dueDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={chargeStatusVariant(charge.status)}>{charge.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payments */}
      <Card title="Payments">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Description', 'Amount', 'Method', 'Paid At'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {tenantPayments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">
                    No payments found.
                  </td>
                </tr>
              ) : (
                tenantPayments.map((payment) => {
                  const charge = tenantCharges.find((c) => c.id === payment.chargeId)
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 text-gray-700">{charge?.description ?? '—'}</td>
                      <td className="px-4 py-3 font-medium text-green-700">{usd(payment.amountPaid)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={methodVariant(payment.method)}>{payment.method}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {format(new Date(payment.paidAt), 'MMM d, yyyy h:mm a')}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Charge Modal */}
      <Modal isOpen={showAddCharge} onClose={() => setShowAddCharge(false)} title="Add Charge">
        <form onSubmit={handleSubmit(onSubmitCharge)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Charge Type</label>
            <select
              {...register('chargeType')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="RENT">Rent</option>
              <option value="LATE FEE">Late Fee</option>
              <option value="UTILITY">Utility</option>
              <option value="DAMAGE">Damage</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              {...register('description')}
              type="text"
              placeholder="e.g. April 2026 Rent"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              {...register('amount')}
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.amount && (
              <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              {...register('dueDate')}
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.dueDate && (
              <p className="text-xs text-red-600 mt-1">{errors.dueDate.message}</p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" className="flex-1">
              Add Charge
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => { setShowAddCharge(false); reset() }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
