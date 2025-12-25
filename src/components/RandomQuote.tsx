import { useState, useEffect } from 'react';
import type { Quote } from '../interfaces/Quote.ts';
import AddQuoteModal from './AddQuoteModal.tsx';
import { useAuth } from 'react-oidc-context';


function RandomQuote() {
    const auth = useAuth();
    const email = auth.user?.profile?.email;
    const [quote, setQuote] = useState('');
    const [author, setAuthor] = useState('');
    const [source, setSource] = useState('');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/quote`)
            .then(response => response.json())
            .then(data => {
                const quote = data[0] as Quote
                setQuote(quote.text);
                setAuthor(quote.author);
                setSource(quote.source);
            })
            .catch(error => console.error('Error fetching quote:', error));
    }, []);

    return (
        <main className="container flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
            {email && <div className="flex w-full justify-end">
                <button onClick={() => setOpen(!open)} className="p-2 border rounded-xl mb-4">Add Quote
                </button>
            </div>}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />
                    <div className="relative z-10 w-full max-w-md rounded-xl bg-black p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <AddQuoteModal onClose={() => setOpen(false)} />
                    </div>
                </div>
            )}
            <div className="relative p-6 border rounded-xl">
                <p className="
                    text-4xl italic
                    before:content-['“']
                    before:absolute before:-top-4 before:-left-4
                    before:text-6xl before:text-gray-300
                    after:content-['”']
                    after:absolute after:-bottom-10 after:-right-4
                    after:text-6xl after:text-gray-300">
                    {quote}
                </p>
            </div>
            <p className="text-lg">{author}</p>
            <p className="text-lg">{source}</p>
        </main>
    );
}

export default RandomQuote;

