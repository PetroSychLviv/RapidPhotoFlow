import type { Photo } from "../types";

export const API_BASE = "http://localhost:4000";

export async function uploadPhotos(files: File[]): Promise<Photo[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const res = await fetch(`${API_BASE}/api/photos`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Upload failed");
  }

  return (await res.json()) as Photo[];
}

export async function getPhotos(): Promise<Photo[]> {
  const res = await fetch(`${API_BASE}/api/photos`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch photos");
  }
  return (await res.json()) as Photo[];
}

export function getPhotoImageUrl(photo: Photo): string {
  return `${API_BASE}/uploads/${photo.filename}`;
}


