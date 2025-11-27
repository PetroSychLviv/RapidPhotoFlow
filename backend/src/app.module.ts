import { Module } from "@nestjs/common";
import { PhotosController } from "./photos.controller";
import { EventsController } from "./events.controller";
import { LogsController } from "./logs.controller";
import { EventStreamService } from "./services/eventStream";
import { ProcessingService } from "./services/processingService";

@Module({
  imports: [],
  controllers: [PhotosController, EventsController, LogsController],
  providers: [EventStreamService, ProcessingService],
})
export class AppModule {}


