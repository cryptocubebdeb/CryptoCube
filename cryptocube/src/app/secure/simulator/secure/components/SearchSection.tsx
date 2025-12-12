"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import Link from "next/link";
import { Search } from "lucide-react";

// Structure of a search result
interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb?: string; // optional coin image
}

export default function SearchSection() {
  // Stores the current search query
  const [query, setQuery] = useState("");

  // Tracks whether a search request is loading
  const [loading, setLoading] = useState(false);

  // Stores the list of coins returned from the API
  const [results, setResults] = useState<SearchResult[]>([]);

  // Controls if the dropdown is open
  const [open, setOpen] = useState(false);

  // Reference for debounce timer to avoid too many API calls
  const debounceRef = useRef<number | null>(null);

  // Reference to the container div for detecting outside clicks
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  /**
   * Fetch search results from CoinGecko API
   */
  async function fetchSearch(queryText: string) {
    if (!queryText.trim()) {
      setResults([]); // clear results if query is empty
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(queryText)}`
      );
      const data = await response.json();

      // Map API data into simplified SearchResult array, take top 10 results
      const coins = (data.coins || []).slice(0, 10).map((c: any) => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        thumb: c.thumb,
      }));
      setResults(coins);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    }
    setLoading(false);
  }

  /**
   * Handles input changes with debounce
   * Prevents sending API request for every keystroke
   */
  function handleChange(value: string) {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      fetchSearch(value);
    }, 300);

    setOpen(true); // always open dropdown when typing
  }

  /**
   * Close dropdown when clicking outside the container
   */
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Calculate dropdown height based on number of results (smooth animation)
  const dropdownHeight = open ? Math.min(results.length * 52 + 60, 300) : 0;

  return (
    <div
      ref={containerRef}
      className="shadow-lg rounded-xl p-6 transition-all duration-300 ease-out"
      style={{ paddingBottom: open ? "1.5rem" : "1.5rem", background: "var(--color-container-bg)" }}
    >
      {/* Section header */}
      <h2 className="text-xl font-bold" style={{ color: 'var(--foreground-alt)', marginBottom: '0.75rem' }}>{t('search.title')}</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--foreground-grey)' }}>{t('search.subtitle')}</p>

      {/* Search input bar */}
      <div
        className="flex items-center rounded-full px-4 py-2 transition-shadow duration-200"
        style={{
          background: 'var(--background-search)',
        }}
      >
        <Search size={18} style={{ color: 'var(--background)', opacity: 0.7 }} />
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={t('search.placeholder')}
          className="ml-3 w-full bg-transparent outline-none placeholder:text-[var(--foreground-search)] placeholder:opacity-80"
          style={{
            color: 'var(--foreground-search)',
          }}
        />
      </div>

      {/* Dropdown menu */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out mt-3 rounded-lg"
        style={{ height: dropdownHeight }}
      >
        <div
          className="border border-[#23252c] rounded-lg h-full overflow-y-auto"
          style={{ background: 'var(--background-search)' }}
        >
          {loading ? (
            <div className="px-4 py-3 text-sm" style={{ color: 'var(--background)', opacity: 0.6 }}>{t('search.searching')}</div>
          ) : results.length > 0 ? (
            results.map((coin) => (
              <Link
                key={coin.id}
                href={`/secure/specificCoin/${coin.id}`}
                className="flex items-center gap-3 px-4 py-3 transition"
                style={{ color: 'var(--foreground-search)' }}
                onClick={() => setOpen(false)}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--background-search-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
              >
                {coin.thumb ? (
                  <img src={coin.thumb} className="w-7 h-7 rounded" alt={coin.name} />
                ) : (
                  <div className="w-7 h-7 rounded" style={{ background: 'rgba(255,255,255,0.10)' }} />
                )}
                <div className="flex flex-col text-sm">
                  <span className="font-medium" style={{ color: 'var(--foreground-search)' }}>{coin.name}</span>
                  <span className="uppercase" style={{ color: 'var(--foreground-background)', opacity: 0.7 }}>{coin.symbol}</span>
                </div>
              </Link>
            ))
          ) : query.length > 0 ? (
            <div className="px-4 py-3 text-sm" style={{ color: 'var(--foreground-grey)' }}>{t('search.noMatches')}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
