import { Injectable } from "@nestjs/common";
import type { PhotoStatus } from "../types";
import { Observable, Subject } from "rxjs";

export type EventPayload =
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

export interface MessageEvent {
  data: EventPayload;
}

@Injectable()
export class EventStreamService {
  private readonly subject = new Subject<MessageEvent>();

  get stream$(): Observable<MessageEvent> {
    return this.subject.asObservable();
  }

  emit(event: EventPayload): void {
    this.subject.next({ data: event });
  }
}

