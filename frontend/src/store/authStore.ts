import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, User } from '../types'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      impersonating: null,

      login: (user: User, token: string) => {
        set({ user, token, impersonating: null })
      },

      logout: () => {
        set({ user: null, token: null, impersonating: null })
      },

      impersonate: (user: User) => {
        set({ impersonating: user })
      },

      stopImpersonating: () => {
        set({ impersonating: null })
      },
    }),
    {
      name: 'propmanager-auth',
    }
  )
)

// Helper: returns the effective user (impersonating target if set, otherwise logged-in user)
export const useEffectiveUser = () => {
  const { user, impersonating } = useAuthStore()
  return impersonating ?? user
}
