import type { PropsWithChildren } from 'react'
import {
  QueryClientProvider,
  type QueryClient,
} from '@tanstack/react-query'

import { StaffSessionProvider } from '@/context/staff-session-context'
import { AuthProvider } from '@/context/auth-context'

type AppProvidersProps = PropsWithChildren<{
  queryClient: QueryClient
}>

export function AppProviders({
  children,
  queryClient,
}: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StaffSessionProvider>
          {children}
        </StaffSessionProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
