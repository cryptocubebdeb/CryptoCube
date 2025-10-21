
//Récupère les IDs des coins dans la watchlist de l'utilisateur connecté

export async function fetchWatchlistIds(): Promise<string[]> {
    try {
        const response = await fetch('/api/watchlist');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération de la watchlist');
        }
        
        const data = await response.json();
        return data.coinIds || [];
    } catch (error) {
        console.error('Error fetching watchlist IDs:', error);
        throw error;
    }
}


//Ajoute un coin à la watchlist

export async function addToWatchlist(coinId: string): Promise<boolean> {
    try {
        const response = await fetch('/api/watchlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coinId }),
        });
        return response.ok;
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        return false;
    }
}


 //Retire un coin de la watchlist
 
export async function removeFromWatchlist(coinId: string): Promise<boolean> {
    try {
        const response = await fetch('/api/watchlist', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coinId }),
        });
        return response.ok;
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        return false;
    }
}
