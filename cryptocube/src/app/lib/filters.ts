import type { CoinData } from './definitions';

export type SortKey = 'market_cap' | 'volume_24h' | 'price' | 'change_24h' | 'change_7d' | 'volatility' | 'name';
export type SortDirection = 'asc' | 'desc';

export interface FiltersState {
  // Performance
  topGagnants: boolean;
  topPerdants: boolean;

  // Volatilité
  faibleVolatilite: boolean;
  hauteVolatilite: boolean;

  // Tri
  sortKey: SortKey;
  sortDirection: SortDirection;

  // Filtres numériques
  priceMin?: number | '';
  priceMax?: number | '';
  marketCapMin?: number | '';
  marketCapMax?: number | '';
  volumeMin?: number | '';
  volumeMax?: number | '';
  change24hMin?: number | '';
  change24hMax?: number | '';

  // Options
  exclureStablecoins: boolean;
  seulementWatchlist: boolean;

  // Tags 
  category?: string; 
  blockchain?: string; 
  categoryTags?: string[];
  blockchainTags?: string[];
}

export const defaultFilters: FiltersState = {
  topGagnants: false,
  topPerdants: false,
  faibleVolatilite: false,
  hauteVolatilite: false,
  sortKey: 'market_cap',
  sortDirection: 'desc',
  priceMin: '',
  priceMax: '',
  marketCapMin: '',
  marketCapMax: '',
  volumeMin: '',
  volumeMax: '',
  change24hMin: '',
  change24hMax: '',
  exclureStablecoins: false,
  seulementWatchlist: false,
  category: 'all',
  blockchain: 'all',
  categoryTags: [],
  blockchainTags: [],
};

// Calcule la volatilité d'une série de prix
export function computeVolatility(prices?: number[]): number | undefined {
  if (!prices || prices.length < 2) return undefined;
  const n = prices.length;
  const mean = prices.reduce((a, b) => a + b, 0) / n;
  const variance = prices.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / (n - 1);
  const std = Math.sqrt(variance);
  // Normaliser par le prix moyen pour rendre comparables 
  return mean !== 0 ? std / mean : std;
}

// Liste des symboles de stablecoins courants
const STABLECOIN_SYMBOLS = new Set([
  'USDT','USDC','DAI','BUSD','TUSD','FDUSD','USDP','USTC','EURC','PYUSD','GUSD','USDD','LUSD','FRAX','EURS'
]);

// Détecte si une cryptomonnaie est un stablecoin
export function isStablecoin(coin: CoinData): boolean {
  const sym = coin.symbol?.toUpperCase();
  const name = coin.name?.toLowerCase();
  const id = coin.id?.toLowerCase();
  if (sym && STABLECOIN_SYMBOLS.has(sym)) return true;
  if (name && name.includes('stable')) return true;
  if (id && id.includes('stable')) return true;
  return false;
}

// Applique les filtres avancés sur une liste de coins
export function applyAdvancedFilters(
  coins: CoinData[],
  filters: FiltersState,
  userWatchlist?: Set<string>
): CoinData[] {
  let list = [...coins];

  // Watchlist
  if (filters.seulementWatchlist && userWatchlist) {
    list = list.filter(c => userWatchlist.has(c.id));
  }

  // Stablecoins
  if (filters.exclureStablecoins) {
    list = list.filter(c => !isStablecoin(c));
  }

  // Performance
  if (filters.topGagnants) {
    list = list.filter(c => (c.price_change_percentage_24h ?? 0) > 0);
  }
  if (filters.topPerdants) {
    list = list.filter(c => (c.price_change_percentage_24h ?? 0) < 0);
  }

  // Plages numériques
  if (filters.priceMin !== '' && filters.priceMin !== undefined) {
    list = list.filter(c => c.current_price >= Number(filters.priceMin));
  }
  if (filters.priceMax !== '' && filters.priceMax !== undefined) {
    list = list.filter(c => c.current_price <= Number(filters.priceMax));
  }
  if (filters.marketCapMin !== '' && filters.marketCapMin !== undefined) {
    list = list.filter(c => (c.market_cap ?? 0) >= Number(filters.marketCapMin));
  }
  if (filters.marketCapMax !== '' && filters.marketCapMax !== undefined) {
    list = list.filter(c => (c.market_cap ?? 0) <= Number(filters.marketCapMax));
  }
  if (filters.volumeMin !== '' && filters.volumeMin !== undefined) {
    list = list.filter(c => (c.total_volume ?? 0) >= Number(filters.volumeMin));
  }
  if (filters.volumeMax !== '' && filters.volumeMax !== undefined) {
    list = list.filter(c => (c.total_volume ?? 0) <= Number(filters.volumeMax));
  }

  // Price change 24h range
  if (filters.change24hMin !== '' && filters.change24hMin !== undefined) {
    list = list.filter(c => (c.price_change_percentage_24h ?? 0) >= Number(filters.change24hMin));
  }
  if (filters.change24hMax !== '' && filters.change24hMax !== undefined) {
    list = list.filter(c => (c.price_change_percentage_24h ?? 0) <= Number(filters.change24hMax));
  }

  // Calcul volatilité 
  const needVol = filters.faibleVolatilite || filters.hauteVolatilite || filters.sortKey === 'volatility';
  let volatilityMap: Record<string, number> | undefined;
  if (needVol) {
    volatilityMap = Object.fromEntries(
      list.map(c => [c.id, computeVolatility(c.sparkline_in_7d?.price) ?? 0])
    );
  }

  // Si l'utilisateur veut faible/haute volatilité en premier, on force le tri
  let sortKey: SortKey = filters.sortKey;
  let sortDirection: SortDirection = filters.sortDirection;
  if (filters.faibleVolatilite) { sortKey = 'volatility'; sortDirection = 'asc'; }
  if (filters.hauteVolatilite)  { sortKey = 'volatility'; sortDirection = 'desc'; }

  // Tri 
  list.sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1;
    const val = (key: SortKey, coin: CoinData): number | string => {
      switch (key) {
        case 'market_cap': return coin.market_cap ?? 0;
        case 'volume_24h': return coin.total_volume ?? 0;
        case 'price': return coin.current_price ?? 0;
        case 'change_24h': return coin.price_change_percentage_24h ?? 0;
        case 'change_7d': return coin.price_change_percentage_7d_in_currency ?? 0;
        case 'volatility': return volatilityMap ? volatilityMap[coin.id] ?? 0 : 0;
        case 'name': return coin.name?.toLowerCase() ?? '';
      }
    };

    const av = val(sortKey, a);
    const bv = val(sortKey, b);

    if (typeof av === 'string' || typeof bv === 'string') {
      return (String(av)).localeCompare(String(bv)) * (sortDirection === 'asc' ? 1 : -1);
    }
    if (av === bv) return 0;
    return av > bv ? dir : -dir;
  });

  return list;
}
