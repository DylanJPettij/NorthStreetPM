import { useOwnerData } from '../../hooks/useOwnerData'
import { allProperties } from '../../data/stubs'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'

export default function ContractorsList() {
  const { contractors } = useOwnerData()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Contractors</h1>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Company', 'Trade', 'Email', 'Phone', 'Assigned Properties'].map((h) => (
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
              {contractors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                    No contractors found.
                  </td>
                </tr>
              ) : (
                contractors.map((contractor) => {
                  const propNames = contractor.propertyIds
                    .map((pid) => allProperties.find((p) => p.id === pid)?.name ?? pid)
                    .join(', ')

                  return (
                    <tr key={contractor.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {contractor.firstName} {contractor.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {contractor.companyName ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="orange">{contractor.trade}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{contractor.email}</td>
                      <td className="px-4 py-3 text-gray-500">{contractor.phone}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                        {propNames || '—'}
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
