import { useState, useEffect } from 'react';
import type { Quote } from '../interfaces/Quote.ts';


function RandomQuote() {
    const [quote, setQuote] = useState('');
    const [author, setAuthor] = useState('');
    const [source, setSource] = useState('');

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

