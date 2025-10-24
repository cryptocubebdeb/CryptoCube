export type User = {
  id: number;          // maps to id_utilisateur
  email: string;       // user's email
  motDePasse: string;    // maps to mot_de_passe
  nom: string;         // last name
  prenom: string;      // first name
  username: string;    // unique username
};

// Interface pour les données de cryptomonnaies
export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap: number;
  total_volume?: number;
  image: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

// Interface pour les données des catégories
export interface CategoryData {
    id: string;
    name: string;
    content: string;
    top_3_coins: string[];
    top_3_coins_id?: string[];
    asset_count?: number;
    market_cap_change_24h: number;
    market_cap_change_7d?: number;
    market_cap_change_30d?: number;
    volume_24h: number;
    market_cap: number;
    sparkline_in_30d?: {
        price: number[];  // Pour chart data
    };
}