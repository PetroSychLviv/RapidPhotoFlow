import { Injectable, OnModuleInit } from "@nestjs/common";
import { appendLogEntry, getAllPhotos, updatePhoto } from "../data/photoStore";
import { Photo } from "../types";
import { EventStreamService } from "./eventStream";

interface ProcessingState {
  [photoId: string]: {
    startedAt: string;
  };
}

const PROCESSING_DURATION_MS = 5000;

@Injectable()
export class ProcessingService implements OnModuleInit {
  private readonly state: ProcessingState = {};

  constructor(private readonly events: EventStreamService) {}

  onModuleInit(): void {
    setInterval(() => {
      this.tick().catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Error in processing tick", err);
      });
    }, 2000);
  }

  private now(): string {
    return new Date().toISOString();
  }

  private async pickNextUploaded(
    photos: Photo[]
  ): Promise<Photo | undefined> {
    return photos.find((p) => p.status === "uploaded");
  }

  private async findProcessing(photos: Photo[]): Promise<Photo | undefined> {
    return photos.find((p) => p.status === "processing");
  }

  private getState(photoId: string): { startedAt: string } | undefined {
    return this.state[photoId];
  }

  async tick(): Promise<void> {
    const photos = await getAllPhotos();

    // Complete processing if any photo has been processing long enough
    const processingPhoto = await this.findProcessing(photos);
    if (processingPhoto) {
      const tracking = this.getState(processingPhoto.id);
      const startedAt = tracking ? new Date(tracking.startedAt).getTime() : 0;
      const elapsed = Date.now() - startedAt;

      if (!tracking || elapsed >= PROCESSING_DURATION_MS) {
        const isSuccess = Math.random() < 0.8;
        const newStatus = isSuccess ? "processed" : "failed";

        const updated = await updatePhoto(processingPhoto.id, {
          status: newStatus,
        });
        await appendLogEntry(processingPhoto.id, {
          timestamp: this.now(),
          message:
            newStatus === "processed"
              ? "Processing succeeded"
              : "Processing failed",
        });

        if (updated) {
          this.events.emit({
            type: "photo-updated",
            photoId: updated.id,
            status: updated.status,
          });
        }

        delete this.state[processingPhoto.id];
        return;
      }

      // If still processing, nothing else to do this tick
      return;
    }

    // If nothing is currently processing, pick the next uploaded photo
    const next = await this.pickNextUploaded(photos);
    if (!next) {
      return;
    }

    const updated = await updatePhoto(next.id, { status: "processing" });
    this.state[next.id] = { startedAt: this.now() };

    await appendLogEntry(next.id, {
      timestamp: this.now(),
      message: "Moved to processing",
    });

    if (updated) {
      this.events.emit({
        type: "photo-updated",
        photoId: updated.id,
        status: updated.status,
      });
    }
  }
}

