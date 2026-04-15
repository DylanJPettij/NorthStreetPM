import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { stubAccounts } from '../../data/stubs'
import Badge from '../../components/ui/Badge'
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

export default function Login() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formMessage, setFormMessage] = useState('')

  const handleStubLogin = (user: User, token: string) => {
    login(user, token)
    navigate(getDashboardPath(user))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormMessage('API not connected in dev mode. Please select a stub account above.')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">NorthStreetPM</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Select an account to log in as (Development Mode)
          </p>
        </div>

        {/* Stub account cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Dev Mode — Quick Login
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {stubAccounts.map((account) => (
              <button
                key={account.token}
                onClick={() => handleStubLogin(account.user, account.token)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {account.user.firstName[0]}{account.user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
                      {account.label}
                    </p>
                    <p className="text-xs text-gray-400">{account.user.email}</p>
                  </div>
                </div>
                <Badge variant={roleBadgeVariant(account.user.role)}>
                  {account.user.role}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Traditional form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Or sign in with credentials</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            {formMessage && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-yellow-800">
                {formMessage}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-primary-700 hover:bg-primary-600 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
