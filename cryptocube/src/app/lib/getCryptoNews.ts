export async function getCryptoNews()
{
    const API_KEY = process.env.NEXT_PUBLIC_NEWSAPI_API_KEY;

    if (!API_KEY) {
        throw new Error("Missing NEWSAPI_API_KEY in environment.");
    }

    try {
        const response = await fetch(
            `https://newsapi.org/v2/everything?q=cryptocurrency OR bitcoin OR ethereum OR crypto&sortBy=publishedAt&pageSize=10&apiKey=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`News API error ${response.status}`);
        }

        const data = await response.json();

        return data.articles.map((article: any, index: number) => ({
            id: index.toString(),
            title: article.title,
            url: article.url,
            description: article.description,
            created_at: article.publishedAt,
            news_site: article.source.name,
            thumbnail: article.urlToImage || '/placeholder.png',
        }));
    }
    catch (error) {
        console.error("Error fetching Crypto news:", error);
        throw error;
    }
}