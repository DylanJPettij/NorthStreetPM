import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { useOwnerData } from '../../hooks/useOwnerData'
import { allTenants, allUnits, allProperties, allTenancies } from '../../data/stubs'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import { mergeLateFees } from '../../utils/charges'
import type { ChargeStatus, ChargeType } from '../../types'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

function chargeStatusVariant(status: ChargeStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'PAID':    return 'success'
    case 'UNPAID':  return 'warning'
    case 'DISPUTE': return 'danger'
    case 'DELETED': return 'neutral'
    case 'WAIVED':  return 'neutral'
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

const STATUS_OPTIONS: ('ALL' | ChargeStatus)[] = ['ALL', 'UNPAID', 'PAID', 'DELETED', 'WAIVED', 'DISPUTE']
const TYPE_OPTIONS: ('ALL' | ChargeType)[] = ['ALL', 'RENT', 'UTILITY', 'DAMAGE', 'OTHER']

export default function ChargesList() {
  const { charges } = useOwnerData()
  const [statusFilter, setStatusFilter] = useState<'ALL' | ChargeStatus>('ALL')
  const [typeFilter, setTypeFilter] = useState<'ALL' | ChargeType>('ALL')

  const enrichedCharges = useMemo(() => {
    return mergeLateFees(charges).map((charge) => {
      const tenancy = allTenancies.find((t) => t.id === charge.tenancyId)
      const tenant = tenancy ? allTenants.find((t) => t.id === tenancy.tenantId) : null
      const unit = tenancy ? allUnits.find((u) => u.id === tenancy.unitId) : null
      const property = unit ? allProperties.find((p) => p.id === unit.propertyId) : null
      return {
        ...charge,
        tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : '—',
        propertyName: property?.name ?? '—',
        unitNumber: unit ? `Unit ${unit.unitNumber}` : '—',
      }
    })
  }, [charges])

  const filtered = enrichedCharges.filter((c) => {
    const statusMatch = statusFilter === 'ALL' || c.status === statusFilter
    const typeMatch = typeFilter === 'ALL' || c.chargeType === typeFilter
    return statusMatch && typeMatch
  })

  const today = new Date()

  const summaryStats = useMemo(() => {
    const pendingTotal = charges
      .filter((c) => c.status === 'UNPAID')
      .reduce((sum, c) => sum + c.amount, 0)

    const overdueTotal = charges
      .filter((c) => c.status === 'UNPAID' && new Date(c.dueDate) < today)
      .reduce((sum, c) => sum + c.amount, 0)

    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const paidThisMonth = charges
      .filter((c) => {
        if (c.status !== 'PAID') return false
        const d = new Date(c.dueDate)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((sum, c) => sum + c.amount, 0)

    return { pendingTotal, overdueTotal, paidThisMonth }
  }, [charges])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Charges</h1>

      {/* Summary bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-400">
          <p className="text-sm text-gray-500">Total Pending</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{usd(summaryStats.pendingTotal)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Total Overdue</p>
          <p className="text-xl font-bold text-red-700 mt-1">{usd(summaryStats.overdueTotal)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Paid This Month</p>
          <p className="text-xl font-bold text-green-700 mt-1">{usd(summaryStats.paidThisMonth)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="text-xs font-medium text-gray-500 mr-2">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mr-2">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <span className="text-sm text-gray-400">
          Showing {filtered.length} of {charges.length} charges
        </span>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Tenant', 'Property', 'Unit', 'Type', 'Description', 'Amount', 'Due Date', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                    No charges found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((charge) => {
                  const isOverdue = charge.status === 'UNPAID' && new Date(charge.dueDate) < today
                  return (
                    <tr key={charge.id} className={`text-sm hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{charge.tenantName}</td>
                      <td className="px-4 py-3 text-gray-600">{charge.propertyName}</td>
                      <td className="px-4 py-3 text-gray-600">{charge.unitNumber}</td>
                      <td className="px-4 py-3">
                        <Badge variant={chargeTypeVariant(charge.chargeType)}>
                          {charge.chargeType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                        {charge.description}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{usd(charge.amount)}</td>
                      <td className={`px-4 py-3 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {format(new Date(charge.dueDate), 'MMM d, yyyy')}
                        {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={chargeStatusVariant(charge.status)}>
                          {charge.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
