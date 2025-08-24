
export const getWikipediaSummary = async (query: string): Promise<string> => {
    const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

    try {
        const response = await fetch(endpoint, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            return `Could not find a relevant Wikipedia article for "${query}". Please try a different query.`;
        }

        const data = await response.json();

        if (data.type === 'disambiguation') {
             return `Your query "${query}" is ambiguous. Please be more specific.`;
        }
        
        return data.extract || `No summary available for "${query}".`;
    } catch (error) {
        console.error("Wikipedia API Error:", error);
        return "Failed to fetch information from Wikipedia. Please check your network connection.";
    }
};
