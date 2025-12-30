import { useState, useEffect } from 'react';
import type { ProjectedQuote } from '../interfaces/ProjectedQuote.ts';
import { useAuth } from 'react-oidc-context';
import { signOutRedirect } from '../helpers/authHelpers.ts';
import Header from './Header.tsx';

export const Search = () => {
    const [authors, setAuthors] = useState<string[]>([]);
    const [genres, setGenres] = useState<string[]>([]);

    const [selectedAuthor, setSelectedAuthor] = useState<string>("");
    const [selectedGenre, setSelectedGenre] = useState<string>("");

    const [quotes, setQuotes] = useState<ProjectedQuote[]>([]);
    const [loading, setLoading] = useState(false);
    const auth = useAuth();

    // Fetch the latest authors and genres
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [authorsRes, genresRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/quote/authors`),
                    fetch(`${import.meta.env.VITE_API_URL}/quote/genres`)
                ]);

                const authorsData = await authorsRes.json();
                const genresData = await genresRes.json();

                setAuthors(authorsData || []);
                setGenres(genresData || []);
            } catch (err) {
                console.error("Error fetching filters:", err);
            }
        };

        fetchFilters();
    }, []);

    // Fetch quotes whenever a filter is selected
    useEffect(() => {
        if (!selectedAuthor && !selectedGenre) {
            setQuotes([]); // No filter selected → no quotes
            return;
        }

        const fetchQuotes = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedAuthor) params.set("author", selectedAuthor);
                if (selectedGenre) params.set("genre", selectedGenre);
                params.set("limit", "10");

                const res = await fetch(`${import.meta.env.VITE_API_URL}/quote/browse?${params}`);
                const data = await res.json();
                setQuotes(data.items || []);
            } catch (err) {
                console.error("Error fetching quotes:", err);
                setQuotes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();
    }, [selectedAuthor, selectedGenre]);

    return (
        <>
            <Header
                onSignIn={() =>
                    auth.signinRedirect()
                }
                onSignOut={() => signOutRedirect(auth)}
            />
            <div className="search-page max-w-4xl mx-auto p-4 space-y-6 pt-24 h-screen overflow-auto">
                {/* Filters */}
                <div className="filters grid sm:grid-cols-2 gap-4">
                    <label className="block">
                        <span className="font-semibold">Author</span>
                        <select
                            value={selectedAuthor}
                            onChange={(e) => setSelectedAuthor(e.target.value)}
                            className="w-full mt-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">
                                Select an author
                            </option>
                            {authors.map((author) => (
                                <option key={author} value={author}>
                                    {author}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="font-semibold">Genre</span>
                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="w-full mt-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">
                                Select a genre
                            </option>
                            {genres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {/* Loading / Empty state */}
                {loading && <p className="text-gray-500">Loading quotes...</p>}
                {!loading && quotes.length === 0 && (selectedAuthor || selectedGenre) && (
                    <p className="text-gray-500">No quotes found for your selection.</p>
                )}

                {/* Quote cards */}
                {!loading && quotes.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {quotes.map((quote) => (
                            <div
                                key={quote.quoteId}
                                className="relative rounded-lg border bg-gray-900 p-4 shadow-sm hover:shadow-md transition"
                            >
                                <p className="italic">“{quote.text}”</p>
                                {(quote.author || quote.genre) && (
                                    <div className="mt-3 text-sm text-gray-300">
                                        {quote.author && <span>{quote.author}</span>}
                                        {quote.author && quote.genre && <span> · </span>}
                                        {quote.genre && <span>{quote.genre}</span>}
                                        {quote.source && <span> · {quote.source}</span>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};
