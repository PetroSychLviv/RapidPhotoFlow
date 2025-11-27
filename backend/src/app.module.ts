import { Module } from "@nestjs/common";
import { PhotosController } from "./photos.controller";
import { EventsController } from "./events.controller";
import { LogsController } from "./logs.controller";
import { EventStreamService } from "./services/eventStream";
import { ProcessingService } from "./services/processingService";
import { EventsGateway } from "./events.gateway";

@Module({
  imports: [],
  controllers: [PhotosController, EventsController, LogsController],
  providers: [EventStreamService, ProcessingService, EventsGateway],
})
export class AppModule {}


