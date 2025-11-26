## RapidPhotoFlow

Minimal photo upload → processing → review workflow built for a hackathon.

### Stack

- **Frontend**: React + TypeScript + Vite (`frontend/`)
- **Backend**: Node.js + TypeScript + Express (`backend/`)
- **Storage**:
  - JSON file as a tiny “database” (`backend/data/photos.json`, auto-created)
  - Uploaded image files on disk (`backend/uploads/`)

### Running the backend

```bash
cd backend
npm install        # first time only
npm run dev        # starts http://localhost:4000
```

This exposes:

- `POST /api/photos` – multipart upload of multiple files (`files` field)
- `GET /api/photos` – list all photos and their statuses + logs
- `GET /api/photos/:id` – fetch a single photo
- `/uploads/*` – serves original image files for the gallery

A background job simulates processing by moving photos:

`uploaded → processing → processed | failed` with log entries.

### Running the frontend

```bash
cd frontend
npm install        # first time only
npm run dev        # starts Vite dev server (default http://localhost:5173)
```

The UI talks to the backend at `http://localhost:4000`. If you change ports,
update `API_BASE` in `frontend/src/api/client.ts`.

### Frontend workflow

- **Upload** tab
  - Select multiple image files and upload them.
  - Files are queued with `status = uploaded`.
- **Queue** tab
  - Polls the backend every 2.5s to show current statuses.
  - Lets you inspect a per-photo event log.
- **Review** tab
  - Displays a responsive gallery of successfully processed photos.

The right-hand “Event Log” panel shows high-level workflow events and errors.


