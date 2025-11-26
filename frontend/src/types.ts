export type PhotoStatus = "uploaded" | "processing" | "processed" | "failed";

export interface PhotoLogEntry {
  timestamp: string;
  message: string;
}

export interface Photo {
  id: string;
  filename: string;
  originalName: string;
  status: PhotoStatus;
  createdAt: string;
  updatedAt: string;
  log: PhotoLogEntry[];
}

export function getStatusLabel(status: PhotoStatus): string {
  switch (status) {
    case "uploaded":
      return "Queued";
    case "processing":
      return "Processing";
    case "processed":
      return "Ready";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}


