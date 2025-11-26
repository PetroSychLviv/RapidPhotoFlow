import type { Response } from "express";
import type { PhotoStatus } from "../types";

type EventPayload =
  | {
      type: "photo-created";
      photoId: string;
      status: PhotoStatus;
    }
  | {
      type: "photo-updated";
      photoId: string;
      status: PhotoStatus;
    };

const clients = new Set<Response>();

export function addEventClient(res: Response): void {
  clients.add(res);

  // Remove client on disconnect
  res.on("close", () => {
    clients.delete(res);
  });
}

export function broadcastEvent(event: EventPayload): void {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of clients) {
    client.write(data);
  }
}


