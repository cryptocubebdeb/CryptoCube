import { CoinData } from './definitions';

/**
*prend tes valeurs (ex: prix du coin) et les convertit en coordonnées utilisables pour dessiner la courbe.
*
 */
export function buildSparklinePoints(values: number[], width = 120, height = 60, padding = 4): string {
  if (!values || values.length === 0) return '';
  //Trouver le minimum / maximum du tableau
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max === min ? 1 : max - min;

  return values
  //Transformer chaque valeur en un point (x,y)
    .map((value, index) => {
      const x = (index / (values.length - 1)) * (width - padding * 2) + padding;
      const normalized = (value - min) / range; //Pour normaliser entre 0 et 1
      const y = height - (normalized * (height - padding * 2) + padding); // flip Y
      return `${x},${y}`;
    })
    .join(' ');
}

/**
 *Additionner toutes les courbes sparkline des coins
 *pour afficher une sparkline globale du marché crypto
 */
export function aggregateSparklines(coins: CoinData[]): number[] | null {
  const sample = coins.find(
    (c) => c.sparkline_in_7d && Array.isArray(c.sparkline_in_7d.price) && c.sparkline_in_7d.price.length > 0
  );
  if (!sample) return null;

  const len = sample!.sparkline_in_7d!.price.length;
  const total = new Array<number>(len).fill(0);
  for (const coin of coins) {
    const p = coin.sparkline_in_7d?.price;
    if (p && p.length === len) {
      for (let i = 0; i < len; i++) 
        total[i] += p[i];
    }
  }
  return total;
}



