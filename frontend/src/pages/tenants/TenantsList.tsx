import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useOwnerData } from '../../hooks/useOwnerData'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { allTenancies } from '../../data/stubs'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import type { RegistrationStatus, TenancyStatus, Tenant, Tenancy } from '../../types'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

function tenancyStatusVariant(status: TenancyStatus): 'success' | 'neutral' | 'danger' {
  switch (status) {
    case 'ACTIVE':  return 'success'
    case 'ENDED':   return 'neutral'
    case 'EVICTED': return 'danger'
  }
}

function regStatusVariant(status: RegistrationStatus): 'success' | 'warning' | 'info' {
  switch (status) {
    case 'REGISTERED': return 'success'
    case 'PENDING':    return 'warning'
    case 'INVITED':    return 'info'
  }
}

function regStatusLabel(status: RegistrationStatus): string {
  switch (status) {
    case 'REGISTERED': return 'Registered'
    case 'PENDING':    return 'Pending Setup'
    case 'INVITED':    return 'Invited'
  }
}

const inviteSchema = z.object({
  firstName:   z.string().min(1, 'First name is required'),
  lastName:    z.string().min(1, 'Last name is required'),
  email:       z.string().email('Enter a valid email address'),
  phone:       z.string().min(7, 'Enter a valid phone number'),
  propertyId:  z.string().optional(),
  unitId:      z.string().optional(),
  monthlyRent: z.coerce.number().min(0).optional(),
})

type InviteForm = z.infer<typeof inviteSchema>

export default function TenantsList() {
  const { tenants, properties, units, tenancies: runtimeTenancies } = useOwnerData()
  const { user, impersonating } = useAuthStore()
  const { addTenant, addTenancy, setUnitOccupied } = useDataStore()
  const effectiveUser = impersonating ?? user
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InviteForm>({ resolver: zodResolver(inviteSchema) })

  const watchedPropertyId = watch('propertyId')

  // Vacant units for the selected property
  const vacantUnits = units.filter(
    (u) => u.propertyId === watchedPropertyId && !u.isOccupied,
  )

  const onSubmit = (data: InviteForm) => {
    const ownerId = effectiveUser?.id ?? ''
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'TENANT',
      isActive: true,
      createdAt: new Date().toISOString(),
      phone: data.phone,
      ownerId,
      registrationStatus: 'INVITED',
      invitedAt: new Date().toISOString(),
    }
    addTenant(newTenant)

    if (data.unitId) {
      const newTenancy: Tenancy = {
        id: `tenancy-${Date.now()}`,
        tenantId: newTenant.id,
        unitId: data.unitId,
        startDate: new Date().toISOString().split('T')[0],
        monthlyRent: data.monthlyRent ?? 0,
        status: 'ACTIVE',
        leaseType: 'FIXED',
      }
      addTenancy(newTenancy)
      setUnitOccupied(data.unitId, true)
    }

    reset()
    setSelectedPropertyId('')
    setModalOpen(false)
    setSuccessMsg(`Invitation sent to ${data.email}. They will receive a link to set up their account.`)
    setTimeout(() => setSuccessMsg(null), 5000)
  }

  const canInvite = effectiveUser?.role === 'OWNER' || effectiveUser?.role === 'SUPER ADMIN'

  const filtered = tenants.filter((t) => {
    const q = search.toLowerCase()
    return (
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    )
  })

  const allTenanciesForLookup = [...allTenancies, ...runtimeTenancies]

  const rows = filtered.map((tenant) => {
    const activeTenancy = allTenanciesForLookup.find(
      (t) => t.tenantId === tenant.id && t.status === 'ACTIVE',
    )
    const unit = activeTenancy ? units.find((u) => u.id === activeTenancy.unitId) : null
    const property = unit ? properties.find((p) => p.id === unit.propertyId) : null
    return { tenant, tenancy: activeTenancy, unit, property }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {canInvite && (
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              + Invite Tenant
            </Button>
          )}
        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
          <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* Tenants table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Email', 'Phone', 'Unit', 'Property', 'Tenancy', 'Reg. Status', 'Invited', 'Monthly Rent', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-400">
                    {search ? 'No tenants match your search.' : 'No tenants yet. Click "Invite Tenant" to get started.'}
                  </td>
                </tr>
              ) : (
                rows.map(({ tenant, tenancy, unit, property }) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-gray-50 text-sm cursor-pointer"
                    onClick={() => navigate(`/tenants/${tenant.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {tenant.firstName} {tenant.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{tenant.email}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{tenant.phone}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {unit ? `Unit ${unit.unitNumber}` : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {property?.name ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {tenancy ? (
                        <Badge variant={tenancyStatusVariant(tenancy.status)}>
                          {tenancy.status}
                        </Badge>
                      ) : (
                        <Badge variant="neutral">No Tenancy</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={regStatusVariant(tenant.registrationStatus)}>
                        {regStatusLabel(tenant.registrationStatus)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {format(new Date(tenant.invitedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                      {tenancy ? usd(tenancy.monthlyRent) : '—'}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/tenants/${tenant.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Tenant Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); reset(); setSelectedPropertyId('') }}
        title="Invite Tenant"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-gray-500 -mt-1">
            An invitation email will be sent to the tenant with a link to set up their account.
          </p>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('firstName')}
                placeholder="Jane"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('lastName')}
                placeholder="Doe"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="jane@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="555-0100"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          {/* Property */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              {...register('propertyId')}
              onChange={(e) => {
                register('propertyId').onChange(e)
                setSelectedPropertyId(e.target.value)
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="">— Select a property —</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit + Monthly Rent — only shown when a property is selected */}
          {watchedPropertyId && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                {vacantUnits.length === 0 ? (
                  <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    No vacant units available for this property.
                  </p>
                ) : (
                  <select
                    {...register('unitId')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="">— Select a unit —</option>
                    {vacantUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        Unit {u.unitNumber} — {u.bedrooms}bd/{u.bathrooms}ba
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {watch('unitId') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Rent <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      {...register('monthlyRent')}
                      type="number"
                      min={0}
                      step={50}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  {errors.monthlyRent && (
                    <p className="text-red-500 text-xs mt-1">{errors.monthlyRent.message}</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setModalOpen(false); reset(); setSelectedPropertyId('') }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
