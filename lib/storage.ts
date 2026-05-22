import fs from "fs";

const STORAGE_PATH = "/tmp/ticket-checks.json";
const MAX_ENTRIES = 10;

export type CheckResult = {
  timestamp: string;
  skipped: boolean;
  reason?: string;
  keywordsFound: boolean;
  callPlaced: boolean;
  error?: string;
};

export function readResults(): CheckResult[] {
  try {
    if (!fs.existsSync(STORAGE_PATH)) return [];
    const raw = fs.readFileSync(STORAGE_PATH, "utf-8");
    return JSON.parse(raw) as CheckResult[];
  } catch {
    return [];
  }
}

export function appendResult(result: CheckResult): void {
  const existing = readResults();
  const updated = [...existing, result].slice(-MAX_ENTRIES);
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(updated, null, 2), "utf-8");
}
