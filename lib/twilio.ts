import twilio from "twilio";

export const CALL_MESSAGE = "Tickets are available, check now.";

export async function placeCall(): Promise<void> {
  const client = twilio(
    process.env.TWILIO_SID!,
    process.env.TWILIO_TOKEN!
  );

  const vercelUrl = process.env.VERCEL_URL;
  const appUrl = vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000";

  await client.calls.create({
    to: process.env.TWILIO_TO!,
    from: process.env.TWILIO_FROM!,
    url: `${appUrl}/api/twiml`,
  });
}
