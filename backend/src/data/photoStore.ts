import { promises as fs } from "fs";
import path from "path";
import { Photo, PhotoLogEntry, PhotoStatus } from "../types";

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DATA_FILE = path.join(DATA_DIR, "photos.json");

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

async function readAllPhotos(): Promise<Photo[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  if (!raw.trim()) return [];
  return JSON.parse(raw) as Photo[];
}

async function writeAllPhotos(photos: Photo[]): Promise<void> {
  await ensureDataFile();
  const payload = JSON.stringify(photos, null, 2);
  await fs.writeFile(DATA_FILE, payload, "utf-8");
}

export async function getAllPhotos(): Promise<Photo[]> {
  return readAllPhotos();
}

export async function getPhotoById(id: string): Promise<Photo | undefined> {
  const photos = await readAllPhotos();
  return photos.find((p) => p.id === id);
}

export async function createPhoto(input: {
  id: string;
  filename: string;
  originalName: string;
  status?: PhotoStatus;
}): Promise<Photo> {
  const photos = await readAllPhotos();
  const now = new Date().toISOString();

  const photo: Photo = {
    id: input.id,
    filename: input.filename,
    originalName: input.originalName,
    status: input.status ?? "uploaded",
    createdAt: now,
    updatedAt: now,
    log: [],
  };

  photos.push(photo);
  await writeAllPhotos(photos);
  return photo;
}

export async function updatePhoto(
  id: string,
  updates: Partial<Pick<Photo, "status" | "filename">>
): Promise<Photo | undefined> {
  const photos = await readAllPhotos();
  const index = photos.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  const now = new Date().toISOString();
  const existing = photos[index];
  const updated: Photo = {
    ...existing,
    ...updates,
    updatedAt: now,
  };

  photos[index] = updated;
  await writeAllPhotos(photos);
  return updated;
}

export async function appendLogEntry(
  id: string,
  entry: PhotoLogEntry
): Promise<Photo | undefined> {
  const photos = await readAllPhotos();
  const index = photos.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  const existing = photos[index];
  const updated: Photo = {
    ...existing,
    log: [...existing.log, entry],
    updatedAt: new Date().toISOString(),
  };

  photos[index] = updated;
  await writeAllPhotos(photos);
  return updated;
}


