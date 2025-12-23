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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-black text-white p-4 rounded-md">
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Add Quote</h2>
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
                <textarea
                    className="w-full rounded-md border p-2"
                    placeholder="Enter quote…"
                    onChange={(e) => setQuote(e.target.value)}
                    value={quote}
                    rows={3}
                />
                <textarea
                    className="w-full rounded-md border p-2"
                    placeholder="Enter Author…"
                    onChange={(e) => setAuthor(e.target.value)}
                    value={author}
                    rows={1}
                />
                <textarea
                    className="w-full rounded-md border p-2"
                    placeholder="Enter genre..."
                    onChange={(e) => setGenre(e.target.value)}
                    value={genre}
                    rows={1}
                />
                <textarea
                    className="w-full rounded-md border p-2"
                    placeholder="Enter source..."
                    onChange={(e) => setSource(e.target.value)}
                    value={source}
                    rows={2}
                />
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border px-4 py-2"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={disableSubmit}
                        className="
                            rounded-md px-4 py-2 text-white transition
                            bg-blue-600 hover:bg-blue-700
                            disabled:bg-gray-400
                            disabled:opacity-60
                            disabled:cursor-not-allowed
                        "
                    >
                        Add Quote
                    </button>

                </div>
            </div>
        </form>
    )
}; 