import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createWalkIn } from '@/services/staff/counter.api'
import { useIdempotencyKey } from '@/hooks/staff/use-idempotency-key'
import type { WalkInRequest, WalkInResult } from '@/types/counter'

export function useWalkIn() {
  const queryClient = useQueryClient()
  const keys = useIdempotencyKey()

  return useMutation<WalkInResult, unknown, WalkInRequest>({
    mutationFn: (request) => createWalkIn(request, keys.keyFor(JSON.stringify(request))),
    onSuccess: () => {
      keys.clear()
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] })
    },
  })
}
