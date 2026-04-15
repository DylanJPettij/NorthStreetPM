import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Badge from '../ui/Badge'
import type { Role } from '../../types'

function roleBadgeVariant(role: Role): 'purple' | 'info' | 'teal' | 'orange' | 'neutral' {
  switch (role) {
    case 'SUPER ADMIN': return 'purple'
    case 'OWNER': return 'info'
    case 'TENANT': return 'teal'
    case 'CONTRACTOR': return 'orange'
    default: return 'neutral'
  }
}

export default function Navbar() {
  const { user, impersonating, logout } = useAuthStore()
  const effectiveUser = impersonating ?? user
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!effectiveUser) return null

  const initials = `${effectiveUser.firstName[0]}${effectiveUser.lastName[0]}`.toUpperCase()

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {impersonating && (
          <Badge variant="warning">Impersonating</Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {effectiveUser.firstName} {effectiveUser.lastName}
          </p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <Badge variant={roleBadgeVariant(effectiveUser.role)}>
              {effectiveUser.role}
            </Badge>
          </div>
        </div>

        {/* Avatar with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(prev => !prev)}
            className="w-9 h-9 rounded-full bg-primary-700 flex items-center justify-center text-white text-sm font-semibold hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            aria-label="Open profile menu"
          >
            {initials}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
              {/* Profile info header */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-semibold text-gray-900">
                  {effectiveUser.firstName} {effectiveUser.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {effectiveUser.email}
                </p>
                <div className="mt-1.5">
                  <Badge variant={roleBadgeVariant(effectiveUser.role)}>
                    {effectiveUser.role}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
