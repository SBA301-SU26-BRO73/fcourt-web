const PREFIX = 'fcourt.guestBooking.'

/**
 * A guest has no account, so the hold token that created the booking stays the credential for its
 * checkout (X-Hold-Token on booking detail, checkout-info, upload-receipt and payment status).
 * It lives in sessionStorage only (never in the URL); after that the guest looks the booking up
 * with the booking code and phone (/lookup). sessionStorage can throw: callers must cope with null.
 */
export function saveGuestBookingToken(bookingId: number, holdToken: string) {
  try {
    sessionStorage.setItem(PREFIX + bookingId, holdToken)
  } catch {
    // ignore
  }
}

export function loadGuestBookingToken(bookingId: number): string | null {
  try {
    return sessionStorage.getItem(PREFIX + bookingId)
  } catch {
    return null
  }
}

export function clearGuestBookingToken(bookingId: number) {
  try {
    sessionStorage.removeItem(PREFIX + bookingId)
  } catch {
    // ignore
  }
}
