## RapidPhotoFlow

Minimal photo upload → processing → review workflow built for a hackathon.

### Stack

- **Frontend**: React + TypeScript + Vite (`frontend/`)
- **Backend**: Node.js + TypeScript + Express (`backend/`)
- **Storage**:
  - JSON file as a tiny “database” (`backend/data/photos.json`, auto-created)
  - Uploaded image files on disk (`backend/uploads/`)

### Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **npm**: comes with Node.js

### Quickstart

From your terminal:

```bash
git clone https://github.com/PetroSychLviv/RapidPhotoFlow.git
cd RapidPhotoFlow

# Install all dependencies (root + backend + frontend)
npm run install:all

# Start backend and frontend together
npm run dev
```

- Backend will run at `http://localhost:4000`
- Frontend (Vite dev server) will run at `http://localhost:5173` (default)

You can now open the frontend URL in your browser and start using the app.

### Running the backend only

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

### Running the frontend only

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


