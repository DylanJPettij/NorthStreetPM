import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  allOwners,
  allTenants,
  allProperties,
  allCharges,
  allUsers,
} from '../../data/stubs'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import type { Role, User } from '../../types'

function roleBadgeVariant(role: Role): 'purple' | 'info' | 'teal' | 'orange' | 'neutral' {
  switch (role) {
    case 'SUPER ADMIN': return 'purple'
    case 'OWNER': return 'info'
    case 'TENANT': return 'teal'
    case 'CONTRACTOR': return 'orange'
    default: return 'neutral'
  }
}

function getDashboardPath(user: User): string {
  if (user.role === 'TENANT') return '/my-dashboard'
  if (user.role === 'SUPER ADMIN') return '/admin'
  return '/dashboard'
}

export default function AdminDashboard() {
  const { impersonate, user: currentUser } = useAuthStore()
  const navigate = useNavigate()

  const pendingTotal = allCharges
    .filter((c) => c.status === 'UNPAID')
    .reduce((sum, c) => sum + c.amount, 0)

  const usd = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  const handleImpersonate = (targetUser: User) => {
    impersonate(targetUser)
    navigate(getDashboardPath(targetUser))
  }

  type UserRow = User & { _impersonatable: boolean }

  const userRows: UserRow[] = allUsers
    .filter((u) => u.id !== currentUser?.id)
    .map((u) => ({ ...u, _impersonatable: true }))

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row: UserRow) => (
        <span className="font-medium text-gray-900">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (row: UserRow) => (
        <Badge variant={roleBadgeVariant(row.role)}>{row.role}</Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row: UserRow) => (
        <Badge variant={row.isActive ? 'success' : 'neutral'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: UserRow) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleImpersonate(row)}
        >
          Impersonate
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>

      {/* Platform stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Owners" value={allOwners.length} color="blue" />
        <StatCard label="Total Tenants" value={allTenants.length} color="teal" />
        <StatCard label="Total Properties" value={allProperties.length} color="green" />
        <StatCard
          label="Platform Pending"
          value={usd(pendingTotal)}
          color="yellow"
        />
      </div>

      {/* All users table */}
      <Card title="All User Accounts">
        <Table<Record<string, unknown>>
          columns={columns as never}
          data={userRows as unknown as Record<string, unknown>[]}
        />
      </Card>
    </div>
  )
}
