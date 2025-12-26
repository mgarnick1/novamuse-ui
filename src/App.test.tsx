// src/App.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import App from './App'

// Mock components
vi.mock('./components/Header.tsx', () => ({
  default: ({ onSignIn, onSignOut }: { onSignIn: () => void; onSignOut: () => void }) => (
    <div data-testid="mock-header">
      <button onClick={onSignIn} data-testid="sign-in-button">
        Sign In
      </button>
      <button onClick={onSignOut} data-testid="sign-out-button">
        Sign Out
      </button>
    </div>
  ),
}))

vi.mock('./components/RandomQuote.tsx', () => ({
  default: () => <div data-testid="mock-random-quote">Random Quote</div>,
}))

// Mock auth hook
const mockSigninRedirect = vi.fn()
const mockRemoveUser = vi.fn()

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    signinRedirect: mockSigninRedirect,
    removeUser: mockRemoveUser,
  }),
}))

// === THE FIX: Directly mock import.meta.env.VITE_CLIENT_ID ===
const originalEnv = import.meta.env

beforeEach(() => {
  vi.resetAllMocks()

  // Override import.meta.env for this test run
  vi.stubGlobal('import', {
    meta: {
      env: {
        ...originalEnv,
        VITE_CLIENT_ID: 'fake-client-id-123',
      },
    },
  })

  // Mock location
  Object.defineProperty(globalThis, 'location', {
    writable: true,
    value: { href: '', origin: 'https://novamusequotes.c3devs.com' },
  })
})

afterEach(() => {
  // Restore original import.meta.env
  vi.stubGlobal('import', { meta: { env: originalEnv } })
})

describe('App', () => {
  it('renders Header and RandomQuote components', () => {
    render(<App />)
    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
    expect(screen.getByTestId('mock-random-quote')).toBeInTheDocument()
  })

  it('calls signinRedirect when Sign In is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('sign-in-button'))
    expect(mockSigninRedirect).toHaveBeenCalledOnce()
  })

  it('redirects to Cognito logout and removes user on Sign Out', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('sign-out-button'))

    const expectedUrl = 
      'https://novamuse.auth.us-east-1.amazoncognito.com/logout' +
      '?client_id=fake-client-id-123' +
      '&logout_uri=https%3A%2F%2Fnovamusequotes.c3devs.com'

    expect(globalThis.location.href).toBe(expectedUrl)
    expect(mockRemoveUser).toHaveBeenCalledOnce()
  })
})