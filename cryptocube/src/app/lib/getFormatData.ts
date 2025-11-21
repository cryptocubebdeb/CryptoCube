'use client'

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
    
    // Format normal
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(marketCap);
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