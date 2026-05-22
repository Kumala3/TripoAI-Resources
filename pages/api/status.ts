import type { NextApiRequest, NextApiResponse } from "next";
import { readResults } from "@/lib/storage";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const results = readResults();
  return res.status(200).json({ results });
}
