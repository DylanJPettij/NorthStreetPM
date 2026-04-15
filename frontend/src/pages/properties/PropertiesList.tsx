import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useOwnerData } from '../../hooks/useOwnerData'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { allOwners } from '../../data/stubs'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import type { Property } from '../../types'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
]

const propertySchema = z.object({
  name:         z.string().min(1, 'Property name is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city:         z.string().min(1, 'City is required'),
  state:        z.string().length(2, 'Select a state'),
  zip:          z.string().regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code'),
})

type PropertyForm = z.infer<typeof propertySchema>

export default function PropertiesList() {
  const { properties, units, tenancies } = useOwnerData()
  const { user, impersonating } = useAuthStore()
  const { addProperty } = useDataStore()
  const effectiveUser = impersonating ?? user
  const navigate = useNavigate()

  const [modalOpen, setModalOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PropertyForm>({ resolver: zodResolver(propertySchema) })

  const onSubmit = (data: PropertyForm) => {
    const ownerId = effectiveUser?.id ?? ''
    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      ownerId,
      name: data.name,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || undefined,
      city: data.city,
      state: data.state,
      zip: data.zip,
      createdAt: new Date().toISOString(),
    }
    addProperty(newProperty)
    reset()
    setModalOpen(false)
    setSuccessMsg(`"${newProperty.name}" has been added to your portfolio.`)
    setTimeout(() => setSuccessMsg(null), 4000)
  }

  const canAdd = effectiveUser?.role === 'OWNER' || effectiveUser?.role === 'SUPER ADMIN'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        {canAdd && (
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            + Add Property
          </Button>
        )}
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

      {/* Property grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {properties.map((property) => {
          const propUnits = units.filter((u) => u.propertyId === property.id)
          const occupiedCount = propUnits.filter((u) => u.isOccupied).length
          const propUnitIds = propUnits.map((u) => u.id)
          const monthlyRevenue = tenancies
            .filter((t) => t.status === 'ACTIVE' && propUnitIds.includes(t.unitId))
            .reduce((sum, t) => sum + t.monthlyRent, 0)
          const owner = allOwners.find((o) => o.id === property.ownerId)
          const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : '—'

          return (
            <div key={property.id} className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{property.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {property.addressLine1}
                  {property.addressLine2 ? `, ${property.addressLine2}` : ''}
                </p>
                <p className="text-sm text-gray-400">
                  {property.city}, {property.state} {property.zip}
                </p>
                {effectiveUser?.role === 'SUPER ADMIN' && (
                  <p className="text-xs text-gray-400 mt-1">Owner: {ownerName}</p>
                )}
              </div>

              {/* Occupancy bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Occupancy</span>
                  <span>{occupiedCount} / {propUnits.length} units</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-green-500 rounded-full transition-all"
                    style={{
                      width: propUnits.length > 0
                        ? `${(occupiedCount / propUnits.length) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Monthly Revenue</p>
                  <p className="text-base font-bold text-gray-900">{usd(monthlyRevenue)}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/properties/${property.id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          )
        })}

        {/* Empty state */}
        {properties.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            No properties yet.{canAdd && ' Click "Add Property" to get started.'}
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); reset() }} title="Add Property">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Property Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="e.g. Maplewood Apartments"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register('addressLine1')}
              placeholder="123 Main St"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>}
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2 <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              {...register('addressLine2')}
              placeholder="Suite 100, Building B, etc."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* City / State / ZIP row */}
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                {...register('city')}
                placeholder="Nashville"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                {...register('state')}
                defaultValue=""
                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="" disabled>—</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP <span className="text-red-500">*</span>
              </label>
              <input
                {...register('zip')}
                placeholder="37201"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip.message}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); reset() }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              Add Property
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
