import { create } from 'zustand'
import { User } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

interface AuthActions {
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export interface AuthStore extends AuthState, AuthActions {}

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: true,
  error: null,
  isAuthenticated: false,
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  setUser: (user) => set((state) => ({
    user,
    isAuthenticated: !!user,
    // Clear profile if user is null
    profile: user ? state.profile : null,
  })),

  setProfile: (profile) => set(() => ({
    profile,
  })),

  setLoading: (loading) => set(() => ({
    loading,
  })),

  setError: (error) => set(() => ({
    error,
  })),

  reset: () => set(() => ({
    ...initialState,
    loading: false,
  })),
}))