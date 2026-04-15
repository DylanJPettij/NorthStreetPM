import { useAuthStore } from '../store/authStore'
import { allOwners } from '../data/stubs'
import type { Owner } from '../types'

/**
 * Returns the Owner object for the currently logged-in user,
 * or the impersonated user if impersonation is active.
 */
export function useCurrentOwner(): Owner | null {
  const { user, impersonating } = useAuthStore()
  const effectiveUser = impersonating ?? user

  if (!effectiveUser) return null

  return allOwners.find((o) => o.id === effectiveUser.id) ?? null
}
