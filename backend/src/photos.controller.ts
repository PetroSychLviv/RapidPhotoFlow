import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as path from "path";
import * as fs from "fs";
import { v4 as uuid } from "uuid";
import type { Photo } from "./types";
import {
  appendLogEntry,
  createPhoto,
  getAllPhotos,
  getPhotoById,
} from "./data/photoStore";
import { EventStreamService } from "./services/eventStream";

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = diskStorage({
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

@Controller("api/photos")
export class PhotosController {
  constructor(private readonly events: EventStreamService) {}

  @Post()
  @UseInterceptors(FilesInterceptor("files", 20, { storage }))
  async upload(
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<Photo[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException("No files uploaded");
    }

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

      this.events.emit({
        type: "photo-created",
        photoId: photo.id,
        status: photo.status,
      });

      created.push(photo);
    }

    created.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return created;
  }

  @Get()
  async list(): Promise<Photo[]> {
    const photos = await getAllPhotos();
    photos.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return photos;
  }

  @Get(":id")
  async byId(@Param("id") id: string): Promise<Photo> {
    const photo = await getPhotoById(id);
    if (!photo) {
      throw new BadRequestException("Photo not found");
    }
    return photo;
  }
}


