import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { GoogleSignInButton } from './google-sign-in-button'

const initialize = vi.fn()
const renderButton = vi.fn()

vi.mock('@/utils/google-identity', () => ({
  loadGoogleIdentity: () => Promise.resolve({ initialize, renderButton }),
}))

describe('GoogleSignInButton', () => {
  afterEach(() => {
    cleanup()
    vi.resetModules()
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  it('renders nothing when VITE_GOOGLE_CLIENT_ID is not configured', () => {
    const { container } = render(<GoogleSignInButton onCredential={vi.fn()} />)
    expect(container.innerHTML).toBe('')
    expect(initialize).not.toHaveBeenCalled()
  })

  it('initialises Google Identity Services and forwards the credential', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-123.apps.googleusercontent.com')
    vi.resetModules()
    const { GoogleSignInButton: Button } = await import('./google-sign-in-button')
    const onCredential = vi.fn()
    render(<Button onCredential={onCredential} />)
    await vi.waitFor(() => expect(renderButton).toHaveBeenCalled())
    const config = initialize.mock.calls[0][0]
    expect(config.client_id).toBe('client-123.apps.googleusercontent.com')
    config.callback({ credential: 'id-token' })
    expect(onCredential).toHaveBeenCalledWith('id-token')
  })
})
