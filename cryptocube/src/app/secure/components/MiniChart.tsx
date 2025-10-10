interface MiniChartProps {
    data: number[];
    isPositive: boolean;
    timeframe?: '24h' | '7d'; // Add timeframe option
}

const MiniChart = ({ data, isPositive, timeframe = '7d' }: MiniChartProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="w-20 h-8 bg-gray-900 rounded flex items-center justify-center text-xs">
                No data
            </div>
        );
    }

    // Si timeframe a 24h, prendre seulement les 24 derniers points de données (environ les dernières 24 heures)
    const chartData = timeframe === '24h' ? data.slice(-24) : data;
    
    // Dimensions du graphique 
    const width = 80;
    const height = 32;
    const padding = 4;

    // Calculer min et max pour normaliser les données
    const minPrice = Math.min(...chartData);
    const maxPrice = Math.max(...chartData);
    const priceRange = maxPrice - minPrice;

    // Créer les points SVG
    const points = chartData.map((price, index) => {
        const x = padding + (index / (chartData.length - 1)) * (width - 2 * padding); // Distribue uniformément les points horizontalement
        const y = height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding); // Convertit le prix en position verticale 
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-20 h-8">
            <svg width={width} height={height} className="w-full h-full">
                <polyline   // Pour dessiner la ligne du graphique
                    points={points}
                    fill="none"
                    stroke={isPositive ? "#10b981" : "#ef4444"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};

export default MiniChart;