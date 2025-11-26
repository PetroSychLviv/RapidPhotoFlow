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


