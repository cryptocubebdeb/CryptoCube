import { CoinData } from './definitions';

/**
 * Convertit un tableau de valeurs numériques en chaîne de points utilisable
 * dans l'attribut `points` d'un élément SVG <polyline>.
 *
 * - values: tableau de nombres (ex. série de prix)
 * - width / height / padding: dimensions du canvas SVG pour normaliser les coordonnées
 * - Retour: chaîne "x1,y1 x2,y2 ..." ou chaîne vide si pas de valeurs
 *
 * Comportement important:
 * - Les valeurs sont normalisées entre min et max pour occuper l'espace vertical
 * - L'axe Y est inversé (valeurs élevées en haut) pour correspondre au rendu SVG
 * - Si toutes les valeurs sont identiques on évite la division par zéro en utilisant range = 1
 * - Complexité: O(n)
 */
export function buildSparklinePoints(values: number[], width = 120, height = 60, padding = 4): string {
  if (!values || values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max === min ? 1 : max - min;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (width - padding * 2) + padding;
      const normalized = (v - min) / range; // 0..1
      const y = height - (normalized * (height - padding * 2) + padding); // flip Y
      return `${x},${y}`;
    })
    .join(' ');
}

/**
 * Agrège (somme) les séries "sparkline" présentes sur les objets CoinData.
 *
 * - Parcourt le tableau `coins` et, si au moins un coin contient
 *   `sparkline_in_7d.price`, construit un tableau `agg` de la même
 *   longueur contenant la somme des valeurs à chaque index temporel.
 * - Retourne `null` si aucune série sparkline n'a été trouvée.
 *
 * Remarques:
 * - On suppose que toutes les séries prises en compte ont la même longueur
 *   (pas de rééchantillonnage effectué). Les coins dont la série a une
 *   longueur différente sont ignorés.
 */
export function aggregateSparklines(coins: CoinData[]): number[] | null {
  const sample = coins.find(
    (c) => c.sparkline_in_7d && Array.isArray(c.sparkline_in_7d.price) && c.sparkline_in_7d.price.length > 0
  );
  if (!sample) return null;
  const len = sample!.sparkline_in_7d!.price.length;
  const agg = new Array<number>(len).fill(0);
  for (const c of coins) {
    const p = c.sparkline_in_7d?.price;
    if (p && p.length === len) {
      for (let i = 0; i < len; i++) agg[i] += p[i];
    }
  }
  return agg;
}

/**
 * Construit une série approximative représentant le "volume" en agrégeant
 * les sparklines prix des coins pondérées par le ratio
 *   weight = total_volume / current_price
 *
 * Rationale:
 * - Si on multiplie le prix par une estimation du nombre d'unités tradées
 *   (total_volume / current_price) on obtient une mesure proche de la
 *   valeur tradée au fil du temps. En sommant ces contributions on obtient
 *   un proxy global de volume temporel.
 *
 * - Retourne `null` si aucune sparkline n'est disponible.
 * - Utilise des valeurs de secours (0 / 1) pour éviter division par zéro
 *   si `total_volume` ou `current_price` sont absents.
 */
export function aggregateVolumeProxy(coins: CoinData[]): number[] | null {
  const sample = coins.find(
    (c) => c.sparkline_in_7d && Array.isArray(c.sparkline_in_7d.price) && c.sparkline_in_7d.price.length > 0
  );
  if (!sample) return null;
  const len = sample!.sparkline_in_7d!.price.length;
  const agg = new Array<number>(len).fill(0);

  for (const c of coins) {
    const p = c.sparkline_in_7d?.price;
    if (p && p.length === len) {
      // compute weight = total_volume / current_price (approx units traded available)
      const weight = (c.total_volume || 0) / (c.current_price || 1);
      for (let i = 0; i < len; i++) {
        agg[i] += p[i] * weight;
      }
    }
  }

  return agg;
}
