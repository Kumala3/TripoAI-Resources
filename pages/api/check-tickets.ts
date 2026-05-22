import type { NextApiRequest, NextApiResponse } from "next";
import { appendResult, type CheckResult } from "@/lib/storage";
import { scrapeToMarkdown } from "@/lib/firecrawl";
import { placeCall } from "@/lib/twilio";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers["authorization"];
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (authHeader !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const result: CheckResult = {
    timestamp: new Date().toISOString(),
    skipped: false,
    keywordsFound: false,
    callPlaced: false,
  };

  try {
    const utcHour = new Date().getUTCHours();
    const localHour = (utcHour + 2) % 24;
    const startHour = parseInt(process.env.START_HOUR ?? "8", 10);
    const endHour = parseInt(process.env.END_HOUR ?? "22", 10);

    if (localHour < startHour || localHour >= endHour) {
      result.skipped = true;
      result.reason = `Outside allowed hours (UTC+2 hour=${localHour}, window=${startHour}-${endHour})`;
      console.log(`[${result.timestamp}] SKIPPED: ${result.reason}`);
      appendResult(result);
      return res.status(200).json({ ok: true, result });
    }

    const url = process.env.TICKET_URL!;
    console.log(`[${result.timestamp}] Scraping ${url}...`);
    const markdown = await scrapeToMarkdown(url);

    const keywords = (process.env.TICKET_KEYWORDS ?? "")
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const lowerMarkdown = markdown.toLowerCase();
    const found = keywords.some((kw) => lowerMarkdown.includes(kw));
    result.keywordsFound = found;
    console.log(`[${result.timestamp}] Keywords found: ${found}`);

    if (found) {
      await placeCall();
      result.callPlaced = true;
      console.log(`[${result.timestamp}] Call placed to ${process.env.TWILIO_TO}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    result.error = message;
    console.error(`[${result.timestamp}] ERROR: ${message}`);
  } finally {
    appendResult(result);
  }

  return res.status(200).json({ ok: true, result });
}
