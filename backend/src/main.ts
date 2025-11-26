import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as express from "express";
import * as path from "path";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  // Static serving of uploaded files to match previous Express behavior
  const uploadsPath = path.join(__dirname, "..", "uploads");
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();
  instance.use("/uploads", express.static(uploadsPath));

  const port = process.env.PORT || 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Nest backend listening on http://localhost:${port}`);
}

bootstrap();


