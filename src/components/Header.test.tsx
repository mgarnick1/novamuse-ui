// src/components/Header.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header.tsx';
import * as oidc from 'react-oidc-context';
import type { AuthContextProps } from 'react-oidc-context';
import { useLocation, useNavigate } from 'react-router-dom';

// Fully mock react-oidc-context to avoid internal useNavigate
vi.mock('react-oidc-context', () => ({
    useAuth: vi.fn(),
}));

// Mock the signOutRedirect helper (if Header imports and uses it directly)
vi.mock('../helpers/authHelpers.ts', () => ({
    signOutRedirect: vi.fn(),
}));


// Mock react-router-dom's useNavigate to return a no-op function
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    const mockNavigate = vi.fn();

    const mockUseLocation = vi.fn().mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'default',
    });
    return {
        ...actual,
        useNavigate: mockNavigate,
        useLocation: mockUseLocation,   // ← Return the mock directly!
    };
});
vi.mock('react')
const mockUseLocation = vi.mocked(useLocation);
const mockUseNavigate = vi.mocked(useNavigate);

describe('Header Component', () => {
    const mockOnSignIn = vi.fn();
    const mockOnSignOut = vi.fn();

    // Force the mock to return our controlled value
    const mockUseAuth = vi.mocked(oidc.useAuth);


    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            signinRedirect: vi.fn(),
            signoutRedirect: vi.fn(),
            // Add minimal required fields to avoid undefined errors
            activeNavigator: undefined,
            isAuthenticating: false,
            events: {
                addAccessTokenExpiring: vi.fn(),
                addAccessTokenExpired: vi.fn(),
                addSilentRenewError: vi.fn(),
                addUserLoaded: vi.fn(),
                addUserUnloaded: vi.fn(),
                addUserSignedOut: vi.fn(),
                addUserSessionChanged: vi.fn(),
                removeAccessTokenExpiring: vi.fn(),
                removeAccessTokenExpired: vi.fn(),
                removeSilentRenewError: vi.fn(),
                removeUserLoaded: vi.fn(),
                removeUserUnloaded: vi.fn(),
                removeUserSignedOut: vi.fn(),
                removeUserSessionChanged: vi.fn(),
            },
        } as unknown as AuthContextProps);
        mockUseLocation.mockReturnValue({
            pathname: '/',
            search: '',
            hash: '',
            state: null,
            key: 'default',
        });
    });

    const setAuthState = (overrides: Partial<oidc.AuthContextProps>) => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            signinRedirect: vi.fn(),
            signoutRedirect: vi.fn(),
            ...overrides,
        } as AuthContextProps);
    };

    it('shows "Sign in" button when user is not authenticated', () => {
        setAuthState({ isAuthenticated: false, user: null });

        render(<Header onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />);

        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
        expect(screen.queryByText(/@example\.com$/)).not.toBeInTheDocument(); // no email shown
    });

    it('shows user name and Sign Out button when authenticated', () => {
        setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: {
                profile: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    sub: '123',
                    iss: 'test-issuer',
                    aud: 'test-audience',
                    exp: 1234567890,
                    iat: 1234567890,
                },
                session_state: 'test-session',
                access_token: 'test-access-token',
                token_type: 'Bearer',
                state: 'test-state',
                scope: 'openid profile email',
                expires_at: 1234567890,
                id_token: 'test-id-token',
                refresh_token: 'test-refresh-token',
                expires_in: 3600,
                expired: false,
                scopes: ['openid', 'profile', 'email'],
                toStorageString: () => 'test-storage-string',
            },
        });

        render(<Header onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />);

        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
    });

    it('calls onSignIn when Sign In button is clicked', () => {
        setAuthState({ isAuthenticated: false });

        render(<Header onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />);

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        expect(mockOnSignIn).toHaveBeenCalledTimes(1);
    });

    it('calls onSignOut with auth object when Sign Out button is clicked', () => {
        const authMock = {
            isAuthenticated: true,
            isLoading: false,
            user: {
                profile: {
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    sub: '123',
                    iss: 'test-issuer',
                    aud: 'test-audience',
                    exp: 1234567890,
                    iat: 1234567890,
                },
                session_state: 'test-session',
                access_token: 'test-access-token',
                token_type: 'Bearer',
                state: 'test-state',
                scope: 'openid profile email',
                expires_at: 1234567890,
                id_token: 'test-id-token',
                refresh_token: 'test-refresh-token',
                expires_in: 3600,
                expired: false,
                scopes: ['openid', 'profile', 'email'],
                toStorageString: () => 'test-storage-string',
            },
        };
        setAuthState(authMock);

        render(<Header onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />);

        fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

        expect(mockOnSignOut).toHaveBeenCalledTimes(1);
        expect(mockOnSignOut).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }));
    });

    it('handles isLoading state gracefully (still shows Sign in)', () => {
        setAuthState({
            isLoading: true,
            isAuthenticated: false,
        });

        render(<Header onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />);

        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
    });

    it('shows email or fallback when name is not available', () => {
        setAuthState({
            isAuthenticated: true,
            user: {
                profile: {
                    name: undefined,
                    email: 'fallback@example.com',
                    sub: '123',
                    iss: 'test-issuer',
                    aud: 'test-audience',
                    exp: 1234567890,
                    iat: 1234567890,
                },
                session_state: 'test-session',
                access_token: 'test-access-token',
                token_type: 'Bearer',
                state: 'test-state',
                scope: 'openid profile email',
                expires_at: 1234567890,
                id_token: 'test-id-token',
                refresh_token: 'test-refresh-token',
                expires_in: 3600,
                expired: false,
                scopes: ['openid', 'profile', 'email'],
                toStorageString: () => 'test-storage-string',
            },
        });

        render(<Header onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />);

        expect(screen.getByText('fallback@example.com')).toBeInTheDocument();
    });

    it('reloads the page when clicking the logo while already on the home page', () => {
        mockUseLocation.mockReturnValue({
            pathname: '/',
            search: '',
            hash: '',
            state: null,
            key: 'default'
        });

        const reloadMock = vi.fn();
        vi.stubGlobal('location', {
            ...window.location,
            reload: reloadMock,
        });

        render(<Header onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />);

        const logoContainer = screen.getByAltText('NovaMuse').closest('div')!;

        fireEvent.click(logoContainer);

        expect(reloadMock).toHaveBeenCalledTimes(1);

        vi.unstubAllGlobals(); // cleanup
    });

    it('navigates to home when clicking the logo from a different page', () => {
        mockUseLocation.mockReturnValue({
            pathname: '/search',
            search: '',
            hash: '',
            state: null,
            key: 'default'
        });

        const testNavigate = vi.fn();
        mockUseNavigate.mockReturnValue(testNavigate);

        render(<Header onSignIn={mockOnSignIn} onSignOut={mockOnSignOut} />);

        const logoContainer = screen.getByAltText('NovaMuse').closest('div')!;

        fireEvent.click(logoContainer);

        expect(testNavigate).toHaveBeenCalledWith('/');
    });
});