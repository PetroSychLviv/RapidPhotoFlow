import { useRef, useState } from "react";
import { uploadPhotos } from "../api/client";
import type { Photo } from "../types";

interface UploadPanelProps {
  onUploaded: (photos: Photo[]) => void;
  onLogMessage: (message: string) => void;
  onGoToQueue: () => void;
}

export function UploadPanel({
  onUploaded,
  onLogMessage,
  onGoToQueue,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setSelectedFiles(files);
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files ?? []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (!droppedFiles.length) return;
    setSelectedFiles(droppedFiles);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleRemoveFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (!selectedFiles.length) return;
    setIsUploading(true);
    onGoToQueue();
    try {
      const created = await uploadPhotos(selectedFiles);
      onUploaded(created);
      onLogMessage(
        `Queued ${created.length} photo${created.length === 1 ? "" : "s"}`
      );
      setSelectedFiles([]);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload failed unexpectedly";
      onLogMessage(`Upload error: ${message}`);
      // eslint-disable-next-line no-alert
      alert(message);
    } finally {
      setIsUploading(false);
    }
  }

  const totalSizeMb =
    selectedFiles.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024);

  const fileCount = selectedFiles.length;
  const rowHeight = 36; // approximate row height in px
  const minListHeight = 64;
  const maxListHeight = Math.min(
    minListHeight + fileCount * rowHeight,
    260 // cap so panel doesn't dominate the column
  );

  return (
    <div className="upload-panel">
      <div className="panel-title">Upload Photos</div>
      <div className="panel-subtitle">
        Drop multiple photos, queue them, and let RapidPhotoFlow simulate the
        processing pipeline.
      </div>

      <div
        className={`upload-zone scroll-sm${
          isDragging ? " upload-zone-dragover" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="file-input"
          onChange={handleFileChange}
        />

        <div className="upload-zone-header">
          <div className="upload-title-group">
            <div className="upload-title">Drop images or pick from device</div>
            <div className="upload-subtitle">
              JPEGs, PNGs, HEIC — we&apos;ll simulate cloud processing.
            </div>
          </div>
          <div className="pill">Parallel uploads</div>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={openFilePicker}
          >
            <span>Browse files</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!selectedFiles.length || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload & Queue"}
          </button>
        </div>

        <div className="upload-meta">
          <span>
            <strong>{selectedFiles.length}</strong> selected
          </span>
          <span>
            Total size:{" "}
            <strong>{totalSizeMb ? totalSizeMb.toFixed(2) : "0.00"} MB</strong>
          </span>
        </div>

        {fileCount > 0 && (
          <div
            className="file-list scroll-sm"
            style={{ maxHeight: `${maxListHeight}px` }}
          >
            <div className="file-list-header">
              <span className="file-col file-col-name">File</span>
              <span className="file-col file-col-size">Size</span>
              <span className="file-col file-col-actions">Actions</span>
            </div>

            {selectedFiles.map((file, index) => (
              <div key={file.name + file.lastModified} className="file-item">
                <span className="file-name file-col-name">{file.name}</span>
                <span className="file-size file-col-size">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-small file-col-actions"
                  onClick={() => handleRemoveFile(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


