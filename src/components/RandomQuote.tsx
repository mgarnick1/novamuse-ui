// deno-lint-ignore-file no-debugger
import { useState, useEffect } from 'react';


function RandomQuote() {
    const [quote, setQuote] = useState('');
    const [author, setAuthor] = useState('');
    const [source, setSource] = useState('');

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/quote`)
            .then(response => response.json())
            .then(data => {
                // eslint-disable-next-line no-debugger
                const quote = data[0]
                setQuote(quote.text);
                setAuthor(quote.author);    
                setSource(quote.source);
            })
            .catch(error => console.error('Error fetching quote:', error));
    }, []);

    return (
        <div>
            <h2>{quote}</h2>
            <p>{author}</p>
            <p>{source}</p>
        </div>
    );
}

export default RandomQuote;

