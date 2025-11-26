import { useEffect, useState } from "react";
import { getPhotos } from "../api/client";
import type { Photo } from "../types";
import { getStatusLabel } from "../types";

interface QueuePanelProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  onSelectPhotoLogs: (photo: Photo | null) => void;
  onLogMessage: (message: string) => void;
}

export function QueuePanel({
  photos,
  onPhotosChange,
  onSelectPhotoLogs,
  onLogMessage,
}: QueuePanelProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function refresh() {
    setIsLoading(true);
    try {
      const data = await getPhotos();
      onPhotosChange(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to refresh processing queue";
      onLogMessage(`Queue error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Initial load
    refresh();
    // Polling
    const id = setInterval(refresh, 2500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasItems = photos.length > 0;

  return (
    <div>
      <div className="panel-title">Processing Queue</div>
      <div className="panel-subtitle">
        Watch items flow from Uploaded → Processing → Ready, in near real-time.
      </div>

      <div style={{ marginBottom: "0.75rem" }} className="flex justify-between">
        <span className="badge-soft">
          {isLoading ? "Syncing…" : "Auto-refresh: 2.5s"}
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={refresh}
        >
          Manual refresh
        </button>
      </div>

      <table className="queue-table scroll-sm">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Status</th>
            <th>Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {!hasItems && (
            <tr>
              <td colSpan={4} className="queue-empty">
                Queue is empty — upload photos to start the workflow.
              </td>
            </tr>
          )}

          {photos.map((photo) => {
            const created = new Date(photo.createdAt).toLocaleTimeString();

            return (
              <tr key={photo.id}>
                <td>
                  <div className="queue-row-main">
                    <span className="queue-name">{photo.originalName}</span>
                    <span className="queue-meta text-xs">
                      id: {photo.id.slice(0, 8)}…
                    </span>
                  </div>
                </td>
                <td>
                  <StatusPill status={photo.status} />
                </td>
                <td>
                  <span className="text-xs text-muted">{created}</span>
                </td>
                <td>
                  <div className="queue-controls">
                    <button
                      type="button"
                      className="btn btn-ghost btn-small"
                      onClick={() => onSelectPhotoLogs(photo)}
                    >
                      View log
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }: { status: Photo["status"] }) {
  const label = getStatusLabel(status);
  return (
    <span className={`status-pill status-pill-${status}`}>
      <span className={`status-dot status-dot-${status}`} />
      {label}
    </span>
  );
}


