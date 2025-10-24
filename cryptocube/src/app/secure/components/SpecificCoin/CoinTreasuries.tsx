"use client";
import { useEffect, useState } from "react";

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
        return <div className="text-white/60 mt-4">Loading treasury data...</div>;
    if (!companies.length)
        return (
            <div className="text-white/60 mt-4">
                No public treasury data available for this coin.
            </div>
        );

    // --- Display the table ---
    return (
        <div className="border border-white/10 rounded-md p-6 text-white/85 shadow-md">
            <h2 className="text-2xl mb-5 font-semibold">
                Public Treasuries Holding {coinId.toUpperCase()}
            </h2>

            {/* Table container */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="border-b border-white/20 text-white/70 uppercase">
                        <tr>
                            <th className="py-2 px-3">Company</th>
                            <th className="py-2 px-3">Country</th>
                            <th className="py-2 px-3 text-right">Holdings</th>
                            <th className="py-2 px-3 text-right">Value (USD)</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* Only show top 10 companies for clarity */}
                        {companies.slice(0, 10).map((currentCompany, index) => (
                            <tr
                                key={index}
                                className="border-b border-white/10 hover:bg-white/5 transition"
                            >
                                {/* This idea was given by ai, I couldn't find any data regarding link for the treasuries, so it recommand me to use the yahoo search and the symbole to search it*/}
                                {/* Company name + clickable Yahoo Finance link */}
                                <td className="py-2 px-3">
                                    <a
                                        href={`https://finance.yahoo.com/quote/${currentCompany.symbol?.split(".")[0]}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:underline"
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
