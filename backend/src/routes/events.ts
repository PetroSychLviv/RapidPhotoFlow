import { Router, Request, Response } from "express";
import { addEventClient } from "../services/eventStream";

export const eventsRouter = Router();

eventsRouter.get("/", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // In some environments, flush headers explicitly if available
  const anyRes = res as any;
  if (typeof anyRes.flushHeaders === "function") {
    anyRes.flushHeaders();
  }

  // Initial comment to establish stream
  res.write(":\n\n");

  addEventClient(res);
});


