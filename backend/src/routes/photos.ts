import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { Photo } from "../types";
import {
  getAllPhotos,
  getPhotoById,
  createPhoto,
  appendLogEntry,
} from "../data/photoStore";

const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const safeBase = base.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${safeBase}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

export const photosRouter = Router();

photosRouter.post(
  "/",
  upload.array("files"),
  async (req: Request, res: Response) => {
    const files = (req.files || []) as Express.Multer.File[];

    if (!files.length) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      const created: Photo[] = [];

      for (const file of files) {
        const id = uuid();
        const photo = await createPhoto({
          id,
          filename: file.filename,
          originalName: file.originalname,
        });

        await appendLogEntry(photo.id, {
          timestamp: new Date().toISOString(),
          message: "Photo uploaded",
        });

        created.push(photo);
      }

      // Newest first
      created.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      res.status(201).json(created);
    } catch (error) {
      console.error("Error handling upload", error);
      res.status(500).json({ error: "Failed to process upload" });
    }
  }
);

photosRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const photos = await getAllPhotos();
    // Newest first
    photos.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    res.json(photos);
  } catch (error) {
    console.error("Error listing photos", error);
    res.status(500).json({ error: "Failed to list photos" });
  }
});

photosRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const photo = await getPhotoById(req.params.id);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }
    res.json(photo);
  } catch (error) {
    console.error("Error fetching photo", error);
    res.status(500).json({ error: "Failed to fetch photo" });
  }
});


