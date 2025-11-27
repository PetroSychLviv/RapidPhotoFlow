import { OnModuleInit } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server } from "socket.io";
import { EventStreamService, MessageEvent } from "./services/eventStream";

@WebSocketGateway({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  namespace: "/events",
})
export class EventsGateway implements OnModuleInit {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly events: EventStreamService) {}

  onModuleInit(): void {
    this.events.stream$.subscribe((event: MessageEvent) => {
      this.server.emit("event", event.data);
    });
  }
}


