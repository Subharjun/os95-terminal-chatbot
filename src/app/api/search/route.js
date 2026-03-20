export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return Response.json({ error: "No query provided." }, { status: 400 });
    }

    const apiKey = process.env.SERPAPI_KEY;
    const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}&num=3`;

    const res = await fetch(serpUrl);
    const data = await res.json();

    // Extract useful snippets
    const results = (data.organic_results || []).slice(0, 3).map((r) => ({
      title: r.title,
      snippet: r.snippet,
      link: r.link,
    }));

    const formatted = results
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.link}`)
      .join("\n\n");

    return Response.json({ results: formatted, raw: results });
  } catch (err) {
    console.error("Search API error:", err);
    return Response.json({ error: "SEARCH_ERROR: " + err.message }, { status: 500 });
  }
}
