import type { NextApiRequest, NextApiResponse } from "next";
import { CALL_MESSAGE } from "@/lib/twilio";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${CALL_MESSAGE}</Say>
</Response>`;

  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(twiml);
}
