import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import AppRouter from './router'
import type { User } from './types'

function getDashboardPath(user: User): string {
  if (user.role === 'TENANT') return '/my-dashboard'
  if (user.role === 'SUPER ADMIN') return '/admin'
  return '/dashboard'
}

function AuthRedirect() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // If user is logged in and on /login, redirect to their dashboard
    if (user && location.pathname === '/login') {
      navigate(getDashboardPath(user), { replace: true })
    }
  }, [user, location.pathname, navigate])

  return null
}

export default function App() {
  return (
    <>
      <AuthRedirect />
      <AppRouter />
    </>
  )
}
