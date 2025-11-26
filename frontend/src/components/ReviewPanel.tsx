import type { Photo } from "../types";
import { getPhotoImageUrl } from "../api/client";

interface ReviewPanelProps {
  photos: Photo[];
}

export function ReviewPanel({ photos }: ReviewPanelProps) {
  const processed = photos.filter((p) => p.status === "processed");

  return (
    <div>
      <div className="panel-title">Review Processed Photos</div>
      <div className="panel-subtitle">
        A lightweight gallery of ready assets coming out of the pipeline.
      </div>

      {processed.length === 0 ? (
        <div className="queue-empty" style={{ marginTop: "0.75rem" }}>
          No processed photos yet — watch this space as items complete.
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
                    <span className="gallery-name">{photo.originalName}</span>
                    <span className="pill-loud text-xs">Processed</span>
                  </div>
                  <div className="gallery-meta">
                    Completed at{" "}
                    <span className="text-xs text-muted">{completedAt}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


