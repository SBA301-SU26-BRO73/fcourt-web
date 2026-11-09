import type { PublicCourt } from '@/types/public-branch'

/** A public court joined with the court type name looked up from /court-types. */
export interface CourtView extends PublicCourt {
  courtTypeName: string
}
