import { useState, useRef, useEffect } from 'react';
import { searchApi } from '../api/search.js';
import { Search, BookOpen } from 'lucide-react';

/**
 * Composant de recherche avec autocomplétion
 * @param {function} onSelect - Callback quand un livre est sélectionné
 * @param {string} placeholder - Placeholder du champ
 */
export default function SearchAutocomplete({ onSelect, placeholder = 'Rechercher un livre...' }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const wrapperRef = useRef(null);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    // Debounce 300ms
    clearTimeout(timerRef.current);
    if (val.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await searchApi.suggest(val);
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (book) => {
    setQuery(book.title);
    setOpen(false);
    onSelect?.(book);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="input pl-10 w-full"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((book) => (
            <button
              key={book._id}
              onClick={() => handleSelect(book)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg)] transition-colors text-left"
            >
              {book.cover ? (
                <img
                  src={book.cover.startsWith('http') ? book.cover : `${import.meta.env.VITE_API_URL || 'http://localhost:7080'}${book.cover}`}
                  alt=""
                  className="w-8 h-11 object-cover rounded shrink-0"
                />
              ) : (
                <div className="w-8 h-11 bg-[var(--color-border)] rounded flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-[var(--color-text-light)]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{book.title}</p>
                <p className="text-xs text-[var(--color-text-light)] truncate">{book.author?.join(', ')}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${book.availableCopies > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {book.availableCopies > 0 ? `${book.availableCopies} dispo.` : 'Indispo.'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
