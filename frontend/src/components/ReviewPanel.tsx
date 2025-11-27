import { useState } from "react";
import type { Photo } from "../types";
import { getPhotoImageUrl } from "../api/client";
import ImageGallery from "react-image-gallery";

interface ReviewPanelProps {
  photos: Photo[];
}

export function ReviewPanel({ photos }: ReviewPanelProps) {
  const processed = photos.filter((p) => p.status === "processed");
  const queuedOrProcessing = photos.filter(
    (p) => p.status === "uploaded" || p.status === "processing"
  );
  const hasAny = processed.length > 0 || queuedOrProcessing.length > 0;

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  const galleryItems =
    processed.length === 0
      ? []
      : processed.map((photo) => {
          const completedAt = new Date(photo.updatedAt).toLocaleTimeString();
          const url = getPhotoImageUrl(photo);
          return {
            original: url,
            thumbnail: url,
            description: `${photo.originalName} • Completed at ${completedAt}`,
          };
        });

  const galleryCards = [
    ...processed.map((photo, index) => ({
      kind: "processed" as const,
      photo,
      processedIndex: index,
    })),
    ...queuedOrProcessing.map((photo) => ({
      kind: "queued" as const,
      photo,
    })),
  ];

  function openLightbox(index: number) {
    setLightboxStartIndex(index);
    setIsLightboxOpen(true);
  }

  function closeLightbox() {
    setIsLightboxOpen(false);
  }

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
        <>
          {galleryCards.length > 0 && (
            <div className="gallery-grid mt-2">
              {galleryCards.map((item) => {
                const photo = item.photo;
                const url = getPhotoImageUrl(photo);

                if (item.kind === "processed") {
                  const completedAt = new Date(
                    photo.updatedAt
                  ).toLocaleTimeString();

                  return (
                    <div
                      className="gallery-card"
                      key={photo.id}
                      onClick={() => openLightbox(item.processedIndex)}
                    >
                      <img
                        src={url}
                        alt={photo.originalName}
                        className="gallery-img"
                      />
                      <div className="gallery-overlay">
                        <div className="flex justify-between align-center">
                          <span className="pill-loud pill-loud-processed text-xs">
                            Processed
                          </span>
                        </div>
                        <div>
                          <div className="gallery-name">
                            {photo.originalName}
                          </div>
                          <div className="gallery-meta">
                            <span className="text-xs text-muted">
                              Completed at {completedAt}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="gallery-card skeleton-card" key={photo.id}>
                    <div className="skeleton-surface" />
                    <div className="gallery-overlay skeleton-overlay">
                      <div className="flex justify-between align-center">
                        <span className="pill-loud pill-loud-muted text-xs">
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
                );
              })}
            </div>
          )}

          {isLightboxOpen && galleryItems.length > 0 && (
            <div
              className="lightbox-backdrop"
              onClick={closeLightbox}
              role="presentation"
            >
              <div
                className="lightbox-dialog"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="lightbox-header">
                  <div className="lightbox-title">Preview photos</div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small lightbox-close"
                    onClick={closeLightbox}
                  >
                    ✕
                  </button>
                </div>

                <div className="lightbox-body">
                  <ImageGallery
                    items={galleryItems}
                    startIndex={lightboxStartIndex}
                    onSlide={(index: number) => setLightboxStartIndex(index)}
                    showPlayButton={false}
                    showFullscreenButton={false}
                    showThumbnails
                    showIndex
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}


