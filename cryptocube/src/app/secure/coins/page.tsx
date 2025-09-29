import Link from "next/link"

export default function Page() {
    return (
        <>
            {/* Hero Section */}
            <div className="min-h-[60vh] flex flex-col justify-center items-center px-4">
                <div className="text-center max-w-4xl mx-auto space-y-8">
                    {/* Main Title */}
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        Navigate the World of Crypto with Ease
                    </h1>
                    
                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl font-light opacity-75">
                        Simple. Fast. Transparent.
                    </p>
                    
                    {/* Barre de recherche */}
                    <div className="max-w-2xl mx-auto mt-8">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Explore crypto..."
                                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section des cryptomonnaies */}
            <div className="min-h-screen p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Titre Overview */}
                    <h2 className="text-3xl font-bold mb-8">Overview</h2>
                    
                    {/* Onglets de navigation */}
                    <div className="flex justify-between items-center mb-8 border-b border-gray-200">
                        <div className="flex space-x-8">
                            {['Top', 'Trending', 'Most Visited', 'Gainers'].map((tab) => (
                                <button
                                    key={tab}
                                    className="pb-2 px-1 font-medium text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 2v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span>Filters</span>
                        </button>
                    </div>

                    {/* Tableau des cryptomonnaies */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-4 px-4 font-medium text-gray-500">#</th>
                                    <th className="text-left py-4 px-4 font-medium text-gray-500">Name</th>
                                    <th className="text-right py-4 px-4 font-medium text-gray-500">Price</th>
                                    <th className="text-right py-4 px-4 font-medium text-gray-500">1h %</th>
                                    <th className="text-right py-4 px-4 font-medium text-gray-500">24h %</th>
                                    <th className="text-right py-4 px-4 font-medium text-gray-500">7d %</th>
                                    <th className="text-right py-4 px-4 font-medium text-gray-500">Market Cap</th>
                                    <th className="text-right py-4 px-4 font-medium text-gray-500">Last 7 Days</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Liste vide pour l'instant */}
                                <tr>
                                    <td colSpan={8} className="py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="text-4xl"></div>
                                            <p className="text-xl">Aucune donnée disponible</p>
                                            <p className="text-sm">Les cryptomonnaies s'afficheront ici</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}