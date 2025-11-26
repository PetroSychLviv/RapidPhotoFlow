import { Controller, Sse } from "@nestjs/common";
import type { Observable } from "rxjs";
import { EventStreamService, MessageEvent } from "./services/eventStream";

@Controller("events")
export class EventsController {
  constructor(private readonly events: EventStreamService) {}

  @Sse()
  stream(): Observable<MessageEvent> {
    return this.events.stream$;
  }
}


