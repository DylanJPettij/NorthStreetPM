import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import AppLayout from '../components/layout/AppLayout'
import type { Role } from '../types'

interface PrivateRouteProps {
  children: React.ReactNode
  allowedRoles?: Role[]
}

export default function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-4">
            You don't have permission to view this page.
          </p>
          <p className="text-sm text-gray-400">
            Your role: <span className="font-semibold">{user.role}</span>
          </p>
        </div>
      </AppLayout>
    )
  }

  return <>{children}</>
}
