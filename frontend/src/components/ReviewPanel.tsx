import type { Photo } from "../types";
import { getPhotoImageUrl } from "../api/client";

interface ReviewPanelProps {
  photos: Photo[];
}

export function ReviewPanel({ photos }: ReviewPanelProps) {
  const processed = photos.filter((p) => p.status === "processed");
  const queuedOrProcessing = photos.filter(
    (p) => p.status === "uploaded" || p.status === "processing"
  );
  const hasAny = processed.length > 0 || queuedOrProcessing.length > 0;

  return (
    <div>
      <div className="panel-title">Review Processed Photos</div>
      <div className="panel-subtitle">
        A lightweight gallery of ready assets coming out of the pipeline.
      </div>

      {!hasAny ? (
        <div className="queue-empty" style={{ marginTop: "0.75rem" }}>
          No photos flowing through yet — upload images to see them appear here
          as they complete.
        </div>
      ) : (
        <div className="gallery-grid mt-2">
          {processed.map((photo) => {
            const completedAt = new Date(photo.updatedAt).toLocaleTimeString();
            const url = getPhotoImageUrl(photo);
            return (
              <div className="gallery-card" key={photo.id}>
                <img
                  src={url}
                  alt={photo.originalName}
                  className="gallery-img"
                />
                <div className="gallery-overlay">
                  <div className="flex justify-between align-center">
                    <span className="pill-loud text-xs">Processed</span>
                  </div>
                  <div>
                    <div className="gallery-name">{photo.originalName}</div>
                    <div className="gallery-meta">
                      <span className="text-xs text-muted">
                        Completed at {completedAt}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {queuedOrProcessing.map((photo) => (
            <div className="gallery-card skeleton-card" key={photo.id}>
              <div className="skeleton-surface" />
              <div className="gallery-overlay skeleton-overlay">
                <div className="flex justify-between align-center">
                  <span className="pill-loud text-xs">
                    {photo.status === "processing" ? "Processing" : "Queued"}
                  </span>
                </div>
                <div>
                  <div className="gallery-name">{photo.originalName}</div>
                  <div className="gallery-meta">
                    <span className="text-xs text-muted">
                      Waiting for processing to complete…
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


