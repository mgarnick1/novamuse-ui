import React, { useState } from "react";
import { useAuth } from "react-oidc-context";


interface AddQuoteModalProps {
    onClose: () => void;
}

export default function AddQuoteModal({ onClose }: AddQuoteModalProps) {
    const [quote, setQuote] = useState('');
    const [author, setAuthor] = useState('');
    const [genre, setGenre] = useState('');
    const [source, setSource] = useState('');
    const [error, setError] = useState('');
    const auth = useAuth();

    const disableSubmit = !quote.trim() || !author.trim() || !genre.trim() || !source.trim();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!quote.trim() || !author.trim() || !genre.trim() || !source.trim()) {
            setError('All fields are required');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/quote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.user?.id_token}`
                },
                body: JSON.stringify({ text: quote, author, genre, source }),
            });
            if (response.ok) {
                onClose();
            } else {
                setError('Failed to add quote');
            }
        } catch (error: unknown) {
            const err = error as Error;
            setError(`An error occurred while adding the quote: ${err.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-gray-900 text-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-auto">
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold">Add Quote</h2>
                {error && (
                    <p className="text-sm text-red-400 bg-red-900/50 px-3 py-2 rounded">{error}</p>
                )}
                <textarea
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter quote…"
                    onChange={(e) => setQuote(e.target.value)}
                    value={quote}
                    rows={3}
                />
                <textarea
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter Author…"
                    onChange={(e) => setAuthor(e.target.value)}
                    value={author}
                    rows={1}
                />
                <textarea
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter genre..."
                    onChange={(e) => setGenre(e.target.value)}
                    value={genre}
                    rows={1}
                />
                <textarea
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter source..."
                    onChange={(e) => setSource(e.target.value)}
                    value={source}
                    rows={2}
                />
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={disableSubmit}
                        className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                    >
                        Add Quote
                    </button>

                </div>
            </div>
        </form>
    )
}; 