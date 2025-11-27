<!-- 227ed085-91de-4cc9-9025-9bc71d13f253 48597bfe-d37f-4021-a0f8-186b4fd5f217 -->
# RapidPhotoFlow Full-Stack Plan (React + Node + TypeScript)

### 1. Confirm Tech & Project Structure

- **Goal**: Have a clear, simple structure and tooling before coding.
- **Decisions**:
- Frontend: React + TypeScript + Vite in `frontend/`.
- Backend: Node.js + TypeScript + NestJS in `backend/` (using modules, controllers, and providers).
- "Database": JSON file(s) on disk in `backend/data/`.
- File storage for uploaded photos: `backend/uploads/`.
- Communication: REST API (JSON) + multipart uploads + realtime updates via Socket.IO.
- **Concrete steps**:

1. Inspect existing `frontend` and `backend` folders to see what’s already there.
2. If needed, initialize backend: `npm init -y` and add TypeScript + NestJS in `backend`.
3. Ensure root README explains how to run both apps.

### 2. Backend Setup (NestJS + TypeScript)

- **Goal**: Type-safe backend that can compile and run with `ts-node` or `tsc`.
- **Concrete steps**:

1. In `backend/`, add:

- `package.json` (if missing) with scripts: `dev`, `build`, `start`.
- Dependencies: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `multer` (for file uploads), and any other NestJS modules you need.
- Dev deps: `typescript`, `ts-node-dev` or `nodemon`, `@types/node`, `@types/express`, `@types/multer`.

2. Add `tsconfig.json` targeting Node LTS, outDir `dist`, rootDir `src`.
3. Create NestJS entrypoint: [`backend/src/main.ts`](backend/src/main.ts) and root module [`backend/src/app.module.ts`](backend/src/app.module.ts):

- Use `NestFactory` to bootstrap the app, enable JSON body parsing and CORS, and (optionally) serve static `/uploads` files.
- Add a simple health-check endpoint (e.g. `GET /health`) via a controller registered in `AppModule`.

4. Add `npm run dev` to run the NestJS server in watch mode.

### 3. File-Based "Database" Layer

- **Goal**: Simple abstraction to read/write photo records from JSON file.
- **Data model**:
- `Photo` type (shared shape):
- `id: string`
- `filename: string`
- `originalName: string`
- `status: 'uploaded' | 'processing' | 'processed' | 'failed'`
- `createdAt: string`
- `updatedAt: string`
- `log: { timestamp: string; message: string }[]`
- Optional: `previewUrl` or `relativePath` for frontend.
- **Concrete steps**:

1. Create [`backend/src/types.ts`](backend/src/types.ts) with `Photo` and status union.
2. Create [`backend/src/data/photoStore.ts`](backend/src/data/photoStore.ts):

- Use a JSON file (e.g. `backend/data/photos.json`).
- Functions: `getAllPhotos`, `getPhotoById`, `createPhoto`, `updatePhoto`, `appendLogEntry`.
- Handle file-not-found by starting with empty array.
- Use `fs/promises` with locking-like behavior (simple: read → modify → write, serially).

3. Ensure all functions are typed and handle basic errors.

### 4. Upload & Photo API Design

- **Goal**: Clean REST endpoints that the React app can call.
- **Endpoints**:

1. `POST /api/photos` (multipart upload):

- Accept multiple files (`files[]`).
- Save each file under `uploads/` with a unique filename.
- For each file, create a `Photo` record with `status = 'uploaded'` and initial log entry.
- Return created photo records.

2. `GET /api/photos`:

- Return list of all photos, newest first.

3. `GET /api/photos/:id` (optional but nice):

- Return single photo by id.

4. `PATCH /api/photos/:id/status` (optional):

- Allow manual status updates if needed for debugging.
- **Concrete steps**:

1. Implement `PhotosController` in [`backend/src/photos.controller.ts`](backend/src/photos.controller.ts) with NestJS decorators (e.g. `@Controller('api/photos')`, `@Post`, `@Get`).
2. Register `PhotosController` in `AppModule` so NestJS exposes it under `/api/photos`.
3. Configure `multer` disk storage via Nest's `FilesInterceptor` to write files into `uploads/`.
4. Ensure responses include enough info for frontend to display thumbnails (e.g. a `/uploads/:filename` static route).

### 5. Processing Simulation & Event-Driven Workflow

- **Goal**: Simulate async processing, update statuses, and append to log.
- **Design choice**: Use a simple in-process polling job (no external queue).
- **Workflow idea**:
- New photos start as `uploaded`.
- Background job runs every X seconds:
- Find first `uploaded` photo → set to `processing` with log entry.
- If a photo is already `processing` and enough time has passed, mark as `processed` or `failed` at random (e.g. 80% success), with log entries.
- **Concrete steps**:

1. Implement [`backend/src/services/processingService.ts`](backend/src/services/processingService.ts):

- Function to `tickProcessing()` called on an interval.
- Reads all photos, determines state transitions, updates store, appends logs.

2. In `server.ts`, start interval timer (e.g. `setInterval(tickProcessing, 2000)`).
3. Ensure logs capture changes: `"Moved to processing"`, `"Processing succeeded"`, `"Processing failed"`.

### 6. Static File Serving for Thumbnails

- **Goal**: Let frontend load images by URL.
- **Concrete steps**:

1. In `main.ts`, use the underlying Express instance to serve `uploads/` statically (e.g. `instance.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))`), adjusting the path for `dist`.
2. Include `imageUrl` or similar computed URL in API responses, or have frontend construct `/uploads/${filename}` from returned `filename`.

### 7. Frontend TypeScript Setup (React + Vite)

- **Goal**: Migrate or initialize frontend to React + TypeScript with a clean structure.
- **Concrete steps**:

1. If existing `frontend` is JS-based Vite React, run Vite’s TS migration:

- Rename main files: `main.jsx` → `main.tsx`, `App.jsx` → `App.tsx`.
- Update imports and add basic TypeScript types.
- Install TypeScript + React types in `frontend`: `typescript`, `@types/react`, `@types/react-dom` (if not already installed).

2. Ensure `tsconfig.json` in `frontend/` is properly configured.
3. Confirm `npm run dev` works.

### 8. Frontend Layout & Navigation

- **Goal**: Simple, modern, 3-panel workflow UI.
- **Concrete steps**:

1. In `App.tsx`, create a minimal layout:

- Top bar with app name.
- Tabs or buttons for: `Upload`, `Queue`, `Review`.

2. Use a lightweight UI approach (Tailwind CSS or custom CSS). If Tailwind:

- Setup Tailwind in `frontend` and wire into `index.css`.

3. Implement simple tab state (e.g. `useState<'upload' | 'queue' | 'review'>`).

### 9. Upload Screen (Upload Photos)

- **Goal**: Let users select multiple photos and send them to backend.
- **Concrete steps**:

1. Create `UploadPanel` component (e.g. [`frontend/src/components/UploadPanel.tsx`](frontend/src/components/UploadPanel.tsx)):

- File input (`multiple`) and/or drag-and-drop area.
- Show selected file names and total count.
- "Upload" button triggering API call.

2. Implement API helper in [`frontend/src/api/client.ts`](frontend/src/api/client.ts):

- `uploadPhotos(files: File[]): Promise<Photo[]>` using `FormData` and `fetch`/`axios`.

3. On success, clear selection and maybe notify user; optionally update local gallery state.

### 10. Processing Queue Screen (Statuses + Realtime Auto-Refresh)

- **Goal**: Show live status of photos and their logs, driven by backend events over Socket.IO.
- **Concrete steps**:

1. Create `QueuePanel` component:

- Fetch list of photos from `GET /api/photos`.
- Subscribe to realtime events over Socket.IO and refresh data when events are received (with optional manual refresh as a fallback).
- Display table/list of photos with:
- Filename / id
- Status badge (color-coded)
- Created time
- Expandable row or side panel to show log entries (scrollable list).

2. Implement `getPhotos()` in `client.ts` returning typed `Photo[]`.
3. Handle loading and error states gracefully.

### 11. Review Screen (Gallery of Processed Photos)

- **Goal**: Visual gallery for successfully processed photos.
- **Concrete steps**:

1. Create `ReviewPanel` component:

- Reuse `getPhotos()` data (either shared state in `App` or internal fetch).
- Filter photos where `status === 'processed'`.
- Display responsive grid of images using their `/uploads/...` URLs.
- Show hover overlay with filename and processed time.

2. Optionally, allow click on an image to open a detail modal (show full log, bigger preview).

### 12. Shared Frontend Types & State Management

- **Goal**: Keep types consistent with backend and centralize basic state.
- **Concrete steps**:

1. Create [`frontend/src/types.ts`](frontend/src/types.ts) with `Photo` type mirroring backend (manually duplicated for simplicity).
2. Optionally create simple context or top-level state in `App.tsx` to share photo list across tabs (or keep each screen’s fetch separate for simplicity).
3. Make sure status values and log shapes match the backend.

### 13. Developer Experience & Scripts

- **Goal**: Easy to run both frontend and backend for hackathon demos.
- **Concrete steps**:

1. In root `README.md`, document:

- How to install deps in `frontend` and `backend`.
- How to run backend (`cd backend && npm run dev`).
- How to run frontend (`cd frontend && npm run dev`).

2. Optionally add a root `package.json` with `concurrently` to run both via a single command.
3. Add `.gitignore` for `node_modules`, `dist`, `uploads`, `data/*.json` if appropriate.

### 14. Basic Validation, Error Handling & Polish

- **Goal**: Make the app feel robust during judging.
- **Concrete steps**:

1. Backend:

- Validate that at least one file is provided.
- Handle JSON/file I/O errors with sensible HTTP responses.

2. Frontend:

- Show toasts or inline messages on upload success/failure.
- Disable upload button while uploading.
- Show skeleton/loading states for queue/review.

3. Add minimal logging to backend console for debugging (e.g. uploads, processing ticks).

### 15. Optional Stretch Goals

- **Ideas**:
- Extend the existing Socket.IO integration with richer event payloads or per-photo channels.
- Add filter and search controls in queue and review views.
- Add per-photo manual "Reprocess" or "Force Fail" buttons.
- Add simple theming (dark/light mode toggle).

---

### Example Prompts You Can Use Step-by-Step

You can walk through the plan with prompts like these (one per phase or sub-phase):

- **Backend setup**:
- "In the `backend` folder, set up a Node.js + TypeScript + NestJS application with `src/main.ts`, `src/app.module.ts`, `tsconfig.json`, and dev/build/start scripts. Enable CORS and add a `GET /health` route in a controller."
- **File database**:
- "Create a `Photo` type and a file-based store in `backend/src/data/photoStore.ts` using a JSON file `backend/data/photos.json` with functions to create, update, and list photos, including an event log array per photo."
- **Upload API**:
- "Add a NestJS `PhotosController` in `backend/src/photos.controller.ts` to handle multipart uploads (`POST /api/photos`), list all photos (`GET /api/photos`), and integrate with the JSON store. Use Nest's `FilesInterceptor`/`multer` to save files and expose image URLs (e.g. via `/uploads`)."
- **Processing job**:
- "Implement a processing simulation service in `backend/src/services/processingService.ts` that periodically (every 2 seconds) moves photos from `uploaded` → `processing` → `processed` or `failed`, updating statuses and appending log entries, and wire it into `server.ts` with `setInterval`."
- **Frontend TS migration**:
- "Convert the existing Vite React frontend to TypeScript: rename `.jsx` files to `.tsx`, add `tsconfig.json`, and fix basic type issues so `npm run dev` works."
- **Frontend UI & screens**:
- "In the React frontend, implement an `App.tsx` with three tabs (Upload, Queue, Review) and create `UploadPanel`, `QueuePanel`, and `ReviewPanel` components under `src/components`, using a modern, minimal layout with Tailwind or custom CSS."
- **API integration**:
- "Create a typed API client in `frontend/src/api/client.ts` with functions `uploadPhotos(files: File[])` and `getPhotos()` that talk to the backend, and wire them into the Upload, Queue, and Review screens with proper loading and error states."
- **Polish**:
- "Improve UX by adding basic error handling, status badges, loading indicators, and a simple log viewer for each photo in the Queue screen."

### To-dos

- [ ] Inspect existing `frontend` and `backend` folders to understand current setup and decide on migration vs. recreation.
- [ ] Implement file-based JSON store and `Photo` model with log support in backend.
- [ ] Add background processing job to simulate async workflow and update photo statuses with logs.
- [ ] Convert existing React frontend to TypeScript with proper tsconfig and type fixes.
- [ ] Implement Upload, Queue, and Review screens with a simple modern layout in React.
- [ ] Connect frontend screens to backend API with a typed client, polling for queue updates, and gallery for processed photos.
- [ ] Document run instructions, add basic error handling and UX polish, and consider small stretch goals if time allows.