import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search } from './Search';
import type { ProjectedQuote } from '../interfaces/ProjectedQuote.js';

// Mock the auth context
vi.mock('react-oidc-context', () => ({
    useAuth: () => ({
        signinRedirect: vi.fn(),
        // signOutRedirect expects the auth object
    }),
}));

// Mock the helper
vi.mock('../helpers/authHelpers.ts', () => ({
    signOutRedirect: vi.fn(),
}));

// Mock Header component
vi.mock('./Header.tsx', () => ({
    default: ({ onSignIn, onSignOut }: { onSignIn: () => void; onSignOut: () => void }) => (
        <header>
            <button onClick={onSignIn}>Sign In</button>
            <button onClick={onSignOut}>Sign Out</button>
        </header>
    ),
}));

// Mock global fetch
globalThis.fetch = vi.fn();

const mockAuthors = ['Mark Twain', 'Jane Austen', 'George Orwell'];
const mockGenres = ['Philosophy', 'Fiction', 'Humor'];

const mockQuotes: ProjectedQuote[] = [
    {
        quoteId: '1',
        text: 'The secret of getting ahead is getting started.',
        author: 'Mark Twain',
        genre: 'Motivational',
        source: 'Book',
        createdAt: '2024-01-01T00:00:00Z',
    },
    {
        quoteId: '2',
        text: 'It is better to be feared than loved.',
        author: 'Machiavelli',
        genre: 'Philosophy',
        source: 'Book',
        createdAt: '2024-01-02T00:00:00Z',
    },
];

function mockFetchResponses() {
    (globalThis.fetch as Mock)
        .mockResolvedValueOnce({
            json: () => Promise.resolve(mockAuthors),
        } as Response) // authors
        .mockResolvedValueOnce({
            json: () => Promise.resolve(mockGenres),
        } as Response); // genres
}

describe('Search Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFetchResponses();
        vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
    });

    it('renders header and filter selects', async () => {
        render(<Search />);

        expect(screen.getByText('Sign In')).toBeInTheDocument();
        expect(screen.getByText('Sign Out')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Author')).toBeInTheDocument();
            expect(screen.getByText('Genre')).toBeInTheDocument();
        });

        expect(screen.getByText('Select an author')).toBeInTheDocument();
        expect(screen.getByText('Select a genre')).toBeInTheDocument();
    });

    it('fetches and displays authors and genres on mount', async () => {
        render(<Search />);

        await waitFor(() => {
            mockAuthors.forEach((author) => {
                expect(screen.getByText(author)).toBeInTheDocument();
            });
            mockGenres.forEach((genre) => {
                expect(screen.getByText(genre)).toBeInTheDocument();
            });
        });
    });

    it('fetches quotes when an author is selected', async () => {
        const user = userEvent.setup();

        // Mock only the browse response (authors/genres are already mocked in beforeEach)
        (globalThis.fetch as Mock).mockResolvedValueOnce({
            json: () => Promise.resolve({ items: mockQuotes }),
        });

        render(<Search />);

        const authorSelect = await screen.findByRole('combobox', { name: /author/i });

        await user.selectOptions(authorSelect, 'Mark Twain');

        // Wait for the /quote/browse call and assert its query params
        await waitFor(() => {
            const browseCalls = (globalThis.fetch as Mock).mock.calls
                .filter((call): call is [string] =>
                    typeof call[0] === 'string' && call[0].includes('/quote/browse')
                );

            expect(browseCalls.length).toBeGreaterThanOrEqual(1);
        });

        // Get the last browse call and parse the URL
        const lastBrowseCall = (globalThis.fetch as Mock).mock.calls
            .filter((call): call is [string] =>
                typeof call[0] === 'string' && call[0].includes('/quote/browse')
            )
            .pop()![0] as string;

        const url = new URL(lastBrowseCall);

        expect(url.pathname).toMatch(/\/quote\/browse$/);
        expect(url.searchParams.get('author')).toBe('Mark Twain');
        expect(url.searchParams.get('limit')).toBe('10');
        expect(url.searchParams.has('genre')).toBe(false);
    });

    it('fetches quotes when a genre is selected', async () => {
        const user = userEvent.setup();

        // Mock the browse response for when genre is selected
        (globalThis.fetch as Mock).mockResolvedValueOnce({
            json: () => Promise.resolve({ items: mockQuotes }),
        });

        render(<Search />);

        // Wait for genres to load
        const genreSelect = await screen.findByRole('combobox', { name: /genre/i });

        await user.selectOptions(genreSelect, 'Philosophy');

        // Wait for the /quote/browse call to occur
        await waitFor(() => {
            const browseCalls = (globalThis.fetch as Mock).mock.calls
                .filter((call): call is [string] =>
                    typeof call[0] === 'string' && call[0].includes('/quote/browse')
                );

            expect(browseCalls.length).toBeGreaterThanOrEqual(1);
        });

        // Get the last browse call and parse its query params
        const lastBrowseCall = (globalThis.fetch as Mock).mock.calls
            .filter((call): call is [string] =>
                typeof call[0] === 'string' && call[0].includes('/quote/browse')
            )
            .pop()![0] as string;

        const url = new URL(lastBrowseCall);

        expect(url.pathname).toMatch(/\/quote\/browse$/);
        expect(url.searchParams.get('genre')).toBe('Philosophy');
        expect(url.searchParams.get('limit')).toBe('10');
        expect(url.searchParams.has('author')).toBe(false); // no author selected
    });

    it('shows loading state while fetching quotes', async () => {
        const user = userEvent.setup();

        let resolveQuotes: (value: { items: ProjectedQuote[] }) => void;
        const quotesPromise = new Promise((resolve) => {
            resolveQuotes = resolve;
        });

        (globalThis.fetch as Mock).mockResolvedValueOnce({
            json: () => quotesPromise,
        });

        render(<Search />);

        const authorSelect = await screen.findByRole('combobox', { name: /author/i });
        await user.selectOptions(authorSelect, 'Mark Twain');

        expect(screen.getByText('Loading quotes...')).toBeInTheDocument();

        resolveQuotes!({ items: mockQuotes });

        await waitFor(() => {
            expect(screen.queryByText('Loading quotes...')).not.toBeInTheDocument();
        });
    });

    it('shows "no quotes found" when API returns empty items', async () => {
        const user = userEvent.setup();

        (globalThis.fetch as Mock).mockResolvedValueOnce({
            json: () => Promise.resolve({ items: [] }),
        });

        render(<Search />);

        const authorSelect = await screen.findByRole('combobox', { name: /author/i });
        await user.selectOptions(authorSelect, 'Jane Austen');

        await waitFor(() => {
            expect(
                screen.getByText('No quotes found for your selection.')
            ).toBeInTheDocument();
        });
    });

    it('clears quotes when both filters are deselected', async () => {
        const user = userEvent.setup();

        (globalThis.fetch as Mock).mockResolvedValueOnce({
            json: () => Promise.resolve({ items: mockQuotes }),
        });

        render(<Search />);

        const authorSelect = await screen.findByRole('combobox', { name: /author/i });

        // Select author → quotes appear
        await user.selectOptions(authorSelect, 'Mark Twain');
        await waitFor(() => {
            expect(screen.getByText(/The secret of getting ahead/)).toBeInTheDocument();
        });

        // Deselect author
        await user.selectOptions(authorSelect, '');

        await waitFor(() => {
            expect(screen.queryByText(/The secret of getting ahead/)).not.toBeInTheDocument();
            expect(screen.queryByText('No quotes found')).not.toBeInTheDocument();
        });
    });

    it('handles fetch errors gracefully', async () => {
        const user = userEvent.setup();
        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => { });

        (globalThis.fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

        render(<Search />);

        const authorSelect = await screen.findByRole('combobox', { name: /author/i });
        await user.selectOptions(authorSelect, 'George Orwell');

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error fetching quotes:',
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });
});