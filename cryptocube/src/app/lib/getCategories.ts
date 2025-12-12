import { CategoryData } from "./definitions";
const URL_API = "https://api.coingecko.com/api/v3";

export const getCategories = async (): Promise<CategoryData[]> => {
    const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
    if (!API_KEY) {
        throw new Error("Missing NEXT_PUBLIC_COINGECKO_API_KEY in environment.");
    }

    const options = {
        method: "GET",
        headers: { "x-cg-demo-api-key": API_KEY, },
    };

    try {
        const response = await fetch(
            `${URL_API}/coins/categories?order=market_cap_desc&per_page=50`,
            options
        );

        if (!response.ok) {
            throw new Error(`CoinGecko server error ${response.status}`);
        }

        const data: CategoryData[] = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
}

export const getCategoryAssetCount = async (categoryId: string): Promise<number> => {
    const response = await fetch(`/api/categories?categoryId=${categoryId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch asset count");
    }
    const { count } = await response.json();
    return count;
}