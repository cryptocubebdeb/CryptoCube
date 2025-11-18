/**
 * Helpers liés à la capitalisation totale.
 *
 * Toute la documentation est en français — ces fonctions visent à être
 * réutilisables depuis plusieurs composants (ex: `CoinsPageContent`).
 */
import { CoinData } from './definitions';

/**
 * Calcule une estimation du pourcentage de changement de la capitalisation totale
 * sur 24 heures en se basant sur `market_cap` et `price_change_percentage_24h` de
 * chaque coin.
 *
 * Méthode : pour chaque coin on estime la capitalisation précédente via :
 *   prevMarketCap = market_cap / (1 + price_change_percentage_24h / 100)
 * Puis on somme totalNow et totalPrev et on calcule le pourcentage global.
 *
 * Retourne `undefined` si aucune donnée de variation 24h n'est disponible ou si
 * le calcul n'est pas possible.
 *
 * Limites : c'est une approximation raisonnable si l'offre en circulation est
 * fixe. Pour une valeur exacte, il faudrait un champ explicite `market_cap_change_24h`
 * ou des séries historiques.
 */
export function computeTotalMarketCapChangePercent(coins: CoinData[] | undefined): number | undefined {
    if (!coins || coins.length === 0) return undefined;

    let totalNow = 0;
    let totalPrev = 0;
    let hasAny = false;

    for (const c of coins) {
        if (typeof c.market_cap !== 'number') continue;
        const now = c.market_cap || 0;
        const pct = typeof c.price_change_percentage_24h === 'number' ? c.price_change_percentage_24h : undefined;

        if (pct === undefined) {
            // Si pas de donnée de variation, on les compte comme inchangés
            totalNow += now;
            totalPrev += now;
        } else {
            const prev = now / (1 + pct / 100);
            totalNow += now;
            totalPrev += prev;
            hasAny = true;
        }
    }

    if (!hasAny) return undefined;
    if (totalPrev === 0) return undefined;

    return ((totalNow - totalPrev) / totalPrev) * 100;
}

export default computeTotalMarketCapChangePercent;
