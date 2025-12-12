"use client";
import { useEffect, useState } from "react";
import { T } from "../../components/Translate";

// --- Type definition for each company holding the coin ---
type TreasuryCompany = {
    name: string;                     // Company name
    symbol?: string; 
    country: string;                  // Country of registration
    total_holdings: number;           // Amount of coins held
    total_entry_value_usd: number;    // Initial value when bought (USD)
    total_current_value_usd: number;  // Current value in USD
    percentage_of_supply: number;     // % of total coin supply held
};

export default function CoinTreasuries({ coinId }: { coinId: string }) {
    // --- State variables ---
    const [companies, setCompanies] = useState<TreasuryCompany[]>([]); // All companies that hold this coin
    const [isLoading, setIsLoading] = useState(true); // Loading state

    // --- Fetch treasury data from CoinGecko ---
    useEffect(() => {
        const fetchTreasuries = async () => {
            try {
                const res = await fetch(
                    `https://api.coingecko.com/api/v3/companies/public_treasury/${coinId}`
                );
                const json = await res.json();

                // The API stores company data under json.companies
                setCompanies(json.companies || []);
            } catch (err) {
                console.error("Error loading treasuries:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTreasuries();
    }, [coinId]);

    // --- Handle loading or empty state ---
    if (isLoading)
        return <div className="text-white/60 mt-4"><T k="treasuries.loading" /></div>;
    if (!companies.length)
        return (
            <div className="text-white/60 mt-4">
                <T k="treasuries.empty" />
            </div>
        );

    // --- Display the table ---
    return (
    <div className="rounded-md p-6 shadow-md" style={{ border: '1px solid var(--foreground)', background: 'var(--color-container-bg)', color: 'var(--foreground)' }}>
            <h2 className="text-2xl mb-5 font-semibold" style={{ color: 'var(--foreground)' }}>
                <T k="treasuries.title" /> <span style={{ color: 'var(--color-blue)' }}>{coinId.toUpperCase()}</span>
            </h2>

            {/* Table container */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm" style={{ color: 'var(--foreground)' }}>
                    <thead className="border-b uppercase" style={{ borderColor: 'var(--foreground)', color: 'var(--foreground)' }}>
                        <tr>
                            <th className="py-2 px-3"><T k="treasuries.company" /></th>
                            <th className="py-2 px-3"><T k="treasuries.country" /></th>
                            <th className="py-2 px-3 text-right"><T k="treasuries.holdings" /></th>
                            <th className="py-2 px-3 text-right"><T k="treasuries.valueUsd" /></th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* Only show top 10 companies for clarity */}
                        {companies.slice(0, 10).map((currentCompany, index) => (
                            <tr
                                key={index}
                                className="border-b border-white/10 transition"
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--coinmarket-hover)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                            >
                                {/* This idea was given by ai, I couldn't find any data regarding link for the treasuries, so it recommand me to use the yahoo search and the symbole to search it*/}
                                {/* Company name + clickable Yahoo Finance link */}
                                <td className="py-2 px-3">
                                    <a
                                        href={`https://finance.yahoo.com/quote/${currentCompany.symbol?.split(".")[0]}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: 'var(--color-blue)', textDecoration: 'underline' }}
                                    >
                                        {currentCompany.name}
                                    </a>
                                </td>

                                {/* Country */}
                                <td className="py-2 px-3">
                                    {currentCompany.country || "—"}
                                </td>

                                {/* Total BTC holdings */}
                                <td className="py-2 px-3 text-right">
                                    {currentCompany.total_holdings.toLocaleString("en-US", {
                                        maximumFractionDigits: 0,
                                    })}
                                </td>

                                {/* Current value in USD */}
                                <td className="py-2 px-3 text-right">
                                    $
                                    {currentCompany.total_current_value_usd.toLocaleString(
                                        "en-US",
                                        { maximumFractionDigits: 0 }
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
