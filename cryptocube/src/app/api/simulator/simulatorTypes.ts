export type PortfolioItem = {
  id: number;
  coinSymbol: string;
  coinId: string;
  amountOwned: number;
  averageEntryPriceUsd: number;
};

export type PendingOrder = {
  id: number;
  coinSymbol: string;
  orderType: "BUY" | "SELL";
  orderKind: string;
  amount: number;
  price: number;
  status: string;
  createdAt: string;
};

export type TradeItem = {
  id: number;
  coinSymbol: string;
  tradeType: "BUY" | "SELL";
  amountTraded: number;
  tradePrice: number;
  tradeTotal: number;
  executedAt: string;
};
