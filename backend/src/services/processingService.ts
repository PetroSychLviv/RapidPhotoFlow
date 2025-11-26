import { appendLogEntry, getAllPhotos, updatePhoto } from "../data/photoStore";
import { Photo } from "../types";
import { broadcastEvent } from "./eventStream";

interface ProcessingState {
  [photoId: string]: {
    startedAt: string;
  };
}

const PROCESSING_DURATION_MS = 5000;
const state: ProcessingState = {};

function now(): string {
  return new Date().toISOString();
}

async function pickNextUploaded(photos: Photo[]): Promise<Photo | undefined> {
  return photos.find((p) => p.status === "uploaded");
}

async function findProcessing(photos: Photo[]): Promise<Photo | undefined> {
  return photos.find((p) => p.status === "processing");
}

export async function tickProcessing(): Promise<void> {
  const photos = await getAllPhotos();

  // Complete processing if any photo has been processing long enough
  const processingPhoto = await findProcessing(photos);
  if (processingPhoto) {
    const tracking = state[processingPhoto.id];
    const startedAt = tracking ? new Date(tracking.startedAt).getTime() : 0;
    const elapsed = Date.now() - startedAt;

    if (!tracking || elapsed >= PROCESSING_DURATION_MS) {
      const isSuccess = Math.random() < 0.8;
      const newStatus = isSuccess ? "processed" : "failed";

      const updated = await updatePhoto(processingPhoto.id, {
        status: newStatus,
      });
      await appendLogEntry(processingPhoto.id, {
        timestamp: now(),
        message:
          newStatus === "processed"
            ? "Processing succeeded"
            : "Processing failed",
      });

      if (updated) {
        broadcastEvent({
          type: "photo-updated",
          photoId: updated.id,
          status: updated.status,
        });
      }

      delete state[processingPhoto.id];
      return;
    }

    // If still processing, nothing else to do this tick
    return;
  }

  // If nothing is currently processing, pick the next uploaded photo
  const next = await pickNextUploaded(photos);
  if (!next) {
    return;
  }

  const updated = await updatePhoto(next.id, { status: "processing" });
  state[next.id] = { startedAt: now() };

  await appendLogEntry(next.id, {
    timestamp: now(),
    message: "Moved to processing",
  });

  if (updated) {
    broadcastEvent({
      type: "photo-updated",
      photoId: updated.id,
      status: updated.status,
    });
  }
}


