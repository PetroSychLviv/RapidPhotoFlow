import { useEffect, useMemo, useState } from "react";
import "./App.css";
import type { Photo } from "./types";
import { UploadPanel } from "./components/UploadPanel";
import { QueuePanel } from "./components/QueuePanel";
import { ReviewPanel } from "./components/ReviewPanel";
import { API_BASE, getPhotos } from "./api/client";

type TabKey = "upload" | "queue" | "review";

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("upload");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedForLogs, setSelectedForLogs] = useState<Photo | null>(null);
  const [logLines, setLogLines] = useState<string[]>([]);

  function handleUploaded(newPhotos: Photo[]) {
    setPhotos((prev) => [...newPhotos, ...prev]);
  }

  function handlePhotosChange(next: Photo[]) {
    setPhotos(next);
    if (selectedForLogs) {
      const updated = next.find((p) => p.id === selectedForLogs.id) ?? null;
      setSelectedForLogs(updated);
    }
  }

  function pushLogLine(line: string) {
    setLogLines((prev) => [
      `[${new Date().toLocaleTimeString()}] ${line}`,
      ...prev,
    ]);
  }

  const selectedLogs = useMemo(
    () => selectedForLogs?.log ?? [],
    [selectedForLogs]
  );

  useEffect(() => {
    let cancelled = false;

    async function refreshFromServer() {
      try {
        const data = await getPhotos();
        if (!cancelled) {
          handlePhotosChange(data);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to refresh photos from server";
          pushLogLine(`Realtime sync error: ${message}`);
        }
      }
    }

    // Initial load on mount
    refreshFromServer();

    const source = new EventSource(`${API_BASE}/events`);
    source.onmessage = () => {
      // Whenever backend sends an event (upload or status change),
      // refresh the photo list so Review tab stays up to date.
      refreshFromServer();
    };
    source.onerror = () => {
      if (!cancelled) {
        pushLogLine("Realtime channel disconnected.");
      }
    };

    return () => {
      cancelled = true;
      source.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title">
          <span className="app-title-main">RapidPhotoFlow</span>
          <span className="app-title-sub">
            Upload → Processing Queue → Review, in a tiny workflow sandbox.
          </span>
        </div>

        <div className="flex gap-3 align-center">
          <nav className="app-tabs">
            <TabButton
              label="Upload"
              isActive={activeTab === "upload"}
              onClick={() => setActiveTab("upload")}
            />
            <TabButton
              label="Queue"
              isActive={activeTab === "queue"}
              onClick={() => setActiveTab("queue")}
            />
            <TabButton
              label="Preview"
              isActive={activeTab === "review"}
              onClick={() => setActiveTab("review")}
            />
          </nav>
          <span className="badge">Hackathon demo</span>
        </div>
      </header>

      <div className="app-body">
        <main className="app-main">
          {activeTab === "upload" && (
            <UploadPanel
              onUploaded={handleUploaded}
              onLogMessage={pushLogLine}
              onGoToQueue={() => setActiveTab("queue")}
            />
          )}
          {activeTab === "queue" && (
            <QueuePanel
              photos={photos}
              onPhotosChange={handlePhotosChange}
              onSelectPhotoLogs={setSelectedForLogs}
              onLogMessage={pushLogLine}
            />
          )}
          {activeTab === "review" && <ReviewPanel photos={photos} />}
        </main>

        <aside className="app-log">
          <div className="app-log-scroll">
            <div>
              <div className="panel-title">Event Log</div>
              <div className="panel-subtitle">
                A running history of queue events and any surfaced errors.
              </div>

              <div className="log-container">
                <div className="log-header">
                  <span>Workflow events</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-small"
                    onClick={() => setLogLines([])}
                  >
                    Clear
                  </button>
                </div>

                <ul className="log-list scroll-sm">
                  {logLines.length === 0 && (
                    <li className="log-empty">
                      No events yet — uploads, queue updates, and errors will
                      land here.
                    </li>
                  )}
                  {logLines.map((line) => (
                    <li key={line} className="log-entry">
                      <span className="log-message">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-3">
              <div className="panel-title">Selected Photo Log</div>
              <div className="panel-subtitle">
                Inspect lifecycle events for a specific photo.
              </div>

              <div className="log-container">
                <div className="log-header">
                  <span>
                    {selectedForLogs
                      ? selectedForLogs.originalName
                      : "Nothing selected"}
                  </span>
                  {selectedForLogs && (
                    <span className="text-xs text-muted">
                      id {selectedForLogs.id.slice(0, 8)}…
                    </span>
                  )}
                </div>

                <ul className="log-list scroll-sm">
                  {selectedForLogs == null && (
                    <li className="log-empty">
                      Choose &ldquo;View log&rdquo; from the queue to inspect a
                      photo.
                    </li>
                  )}
                  {selectedForLogs != null && selectedLogs.length === 0 && (
                    <li className="log-empty">
                      This photo hasn&apos;t accumulated any events yet.
                    </li>
                  )}
                  {selectedLogs.map((entry) => (
                    <li
                      key={entry.timestamp + entry.message}
                      className="log-entry"
                    >
                      <span className="log-timestamp">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="log-message">{entry.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      className={`tab-button ${isActive ? "tab-button-active" : ""}`}
      onClick={onClick}
    >
      <span>{label}</span>
    </button>
  );
}



