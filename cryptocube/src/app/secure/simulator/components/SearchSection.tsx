"use client";

import { useEffect, useRef, useState } from "react";
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
      className="bg-[#11131b] border border-[#23252c] rounded-xl p-6 transition-all duration-300 ease-out"
      style={{ paddingBottom: open ? "1.5rem" : "1.5rem" }}
    >
      {/* Section header */}
      <h2 className="text-xl font-bold text-yellow-400 mb-3">Search</h2>
      <p className="text-sm text-slate-400 mb-4">
        Search for coins to trade in the simulator.
      </p>

      {/* Search input bar */}
      <div className="flex items-center bg-slate-800 rounded-full px-4 py-2 transition-shadow duration-200">
        <Search size={18} className="text-white/60" />
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search cryptocurrency..."
          className="ml-3 w-full bg-transparent text-white placeholder-white/50 outline-none"
        />
      </div>

      {/* Dropdown menu */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out mt-3 rounded-lg"
        style={{ height: dropdownHeight }}
      >
        <div className="bg-slate-800 border border-[#23252c] rounded-lg h-full overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-white/70">Searching…</div>
          ) : results.length > 0 ? (
            results.map((coin) => (
              <Link
                key={coin.id}
                href={`/secure/specificCoin/${coin.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 text-white transition"
                onClick={() => setOpen(false)}
              >
                {coin.thumb ? (
                  <img src={coin.thumb} className="w-7 h-7 rounded" alt={coin.name} />
                ) : (
                  <div className="w-7 h-7 rounded bg-white/10" />
                )}
                <div className="flex flex-col text-sm">
                  <span className="font-medium">{coin.name}</span>
                  <span className="text-white/60 uppercase">{coin.symbol}</span>
                </div>
              </Link>
            ))
          ) : query.length > 0 ? (
            <div className="px-4 py-3 text-sm text-white/60">No matches found.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
