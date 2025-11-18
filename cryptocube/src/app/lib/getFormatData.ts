'use client'
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export function getFormatPrix(price: number)
{
    if (price === null || price === undefined) return 'N/A';

   return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price);
}

export function getFormatMarketCap(marketCap: number)
{
    if (marketCap === null || marketCap === undefined) return 'N/A';
   if (marketCap >= 1e9) {
       const billions = marketCap / 1e9;
       const [intPart, decPart] = billions.toFixed(6).split('.');
       return `$${intPart},${decPart}`;
   }

   // if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
   // if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
   // if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
   // return `$${marketCap.toFixed(2)}`; // Montre 2 décimales

   return `$${marketCap.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function getFormatPercentage(percentage: number | undefined)
{
    if (percentage === null || percentage === undefined) return { value: 'N/A', isPositive: null };
    
    const isPositive = percentage >= 0;
    return {
        value: `${Math.abs(percentage).toFixed(2)}%`,
        isPositive: isPositive
    };
}