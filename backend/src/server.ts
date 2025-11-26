import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { photosRouter } from "./routes/photos";
import { eventsRouter } from "./routes/events";
import { tickProcessing } from "./services/processingService";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Static serving of uploaded files
const uploadsPath = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsPath));

// API routes
app.use("/api/photos", photosRouter);
app.use("/events", eventsRouter);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Background processing simulation
setInterval(() => {
  tickProcessing().catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Error in processing tick", err);
  });
}, 2000);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend server listening on http://localhost:${PORT}`);
});


