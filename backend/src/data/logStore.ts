import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DATA_FILE = path.join(DATA_DIR, "workflow-log.json");

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

async function readAllLines(): Promise<string[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  if (!raw.trim()) return [];
  return JSON.parse(raw) as string[];
}

async function writeAllLines(lines: string[]): Promise<void> {
  await ensureDataFile();
  const payload = JSON.stringify(lines, null, 2);
  await fs.writeFile(DATA_FILE, payload, "utf-8");
}

export async function getAllWorkflowLogs(): Promise<string[]> {
  return readAllLines();
}

export async function appendWorkflowLog(line: string): Promise<string[]> {
  const lines = await readAllLines();
  const next = [line, ...lines];
  await writeAllLines(next);
  return next;
}

export async function clearWorkflowLogs(): Promise<void> {
  await writeAllLines([]);
}


