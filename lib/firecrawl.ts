import FirecrawlApp from "@mendable/firecrawl-js";

export async function scrapeToMarkdown(url: string): Promise<string> {
  const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_KEY! });
  const result = await app.scrapeUrl(url, { formats: ["markdown"] });

  if (!result.success) {
    throw new Error(`Firecrawl scrape failed: ${(result as { error?: string }).error ?? "unknown error"}`);
  }

  return (result as { markdown?: string }).markdown ?? "";
}
