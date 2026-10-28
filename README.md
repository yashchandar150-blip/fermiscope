# FermiScope - Alien Civilization Research and Signal Detection System

A MERN stack college project exploring the Fermi Paradox: *"If super civilizations exist, why haven't we found them yet?"*

> **Scientific limitation.** FermiScope uses **simulated educational data** and **simplified rules**.
> It cannot detect or prove extraterrestrial life. Any "Potential Artificial Signal" is shown as an
> **UNCONFIRMED CANDIDATE** that needs further scientific verification.
> The confidence score means *how strongly the app's rules matched*, **not** the probability that aliens exist.

## Tech stack
React + Vite, React Router, Bootstrap 5, Axios, Recharts | Node.js + Express | MongoDB + Mongoose | JWT + bcryptjs

## How it fits together
```
Browser (React, :5173)  --/api (Axios, proxied by Vite)-->  Express (:5000)  --Mongoose-->  MongoDB (:27017)
```
Backend layers: `routes` (URL list) → `controllers` (request/response) → `services` (signal engine, PDF) → `models` (database).
Roles (researcher / admin) are checked in the frontend (`ProtectedRoute`) **and** the backend (`protect`, `adminOnly`, ownership checks).

## Requirements
Node.js 18+, MongoDB running locally (or a MongoDB Atlas URI), VS Code.

## Install and run
```bash
# 1. open the fermiscope folder in VS Code, then in the terminal:
npm run install-all        # installs root, backend and frontend packages

# 2. check backend/.env (MONGO_URI points to local MongoDB by default)

# 3. load the simulated demo data
npm run seed

# 4. start backend (5000) and frontend (5173) together
npm run dev
```
Open **http://localhost:5173**. (Or run `npm run dev` inside `backend` and `frontend` in two terminals.)

### Demo logins (created by the seed script)
| Role | Email | Password |
|---|---|---|
| Administrator | admin@fermiscope.com | Admin@123 |
| Researcher | researcher@fermiscope.com | Researcher@123 |
| Researcher 2 | researcher2@fermiscope.com | Researcher@123 |

`npm run seed` **deletes and recreates** the demo data every time it is run.

## Signal analysis workflow (the main feature)
1. **Detection** - enter a signal manually or pick one of the 6 simulated samples.
2. **Classification** - four rule steps in order: human-made interference → natural pattern → candidate criteria (narrowband + repeated + stable...) → unknown.
3. **Confidence** - transparent points per rule, capped at 95%, no randomness. The result page shows the breakdown.
4. **Verification** - researchers update the status by hand (Detected, Under Investigation, Interference Suspected, Repeated Observation Required, Verified as Natural, Unconfirmed Candidate). Every change is kept in a history.

All thresholds live in `backend/services/signalAnalysisService.js` (`SETTINGS`). Units: frequency MHz, strength dB (SNR), duration s, bandwidth Hz.

## Demonstration script (for your viva)
1. Login as **researcher** → Dashboard (stats and 4 charts come from MongoDB).
2. **Analyze Signal → Sample signals** → click each of the 6 samples and compare classifications and score breakdowns. Save the candidate one.
3. On the result page change the **verification status** and show the history.
4. **Observations**: add, search, filter, sort, edit, delete. Use "Analyze this signal" on an observation.
5. **Hypothesis Explorer**: search, open one, save a personal note.
6. **Research Reports**: create one linking observations, analyses and hypotheses → **Export PDF**.
7. Logout, login as **admin** → Admin Dashboard, Manage Users (change role, delete), all observations and reports.
8. Try opening `/admin` as a researcher: you are redirected. Calling an admin API without the role returns 403.

## API quick reference (all except auth need `Authorization: Bearer <token>`)
| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Observations | `GET/POST /api/observations`, `GET/PUT/DELETE /api/observations/:id` (query: `search`, `type`, `status`, `sort`) |
| Analyses | `GET/POST /api/analyses`, `GET/PUT/DELETE /api/analyses/:id`, `GET /api/analyses/samples` |
| Engine (preview, not saved) | `POST /api/analyses/analyze`, `POST /api/analyses/analyze-sample` |
| Reports | `GET/POST /api/reports`, `GET/PUT/DELETE /api/reports/:id`, `GET /api/reports/:id/pdf` |
| Hypotheses | `GET /api/hypotheses`, `GET /api/hypotheses/:id`, `PUT /api/hypotheses/:id/note` |
| Dashboard | `GET /api/dashboard/stats` |
| Users | `GET /api/users` (admin), `GET/PUT /api/users/:id`, `DELETE /api/users/:id` (admin) |
| Optional data | `GET /api/astronomy/status`, `GET /api/astronomy/targets` |

### Test with curl
```bash
curl http://localhost:5000/api/health

TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"researcher@fermiscope.com","password":"Researcher@123"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).token")

curl -X POST http://localhost:5000/api/analyses/analyze -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"frequency":1457.3,"signalStrength":14,"duration":120,"bandwidth":3,"signalPattern":"Steady Carrier","isRepeated":true}'
```

## Automated tests (no database needed)
```bash
cd backend
npm run test:engine    # sample signals produce their documented classification and score
npm run test:offline   # seed data vs schemas, 401/400/404 security checks, PDF builder
```

## Real astronomy data
The app works fully with simulated data. `backend/services/astronomyDataService.js` is an **optional** layer: set `ENABLE_REAL_DATA=true` in `backend/.env` to read nearby exoplanet host-star names from the public NASA Exoplanet Archive (no key needed). These are star names and distances only, not radio signals; if the request fails it falls back to simulated targets.

## Folder structure
```
fermiscope/
├── package.json            (root scripts: install-all, dev, seed)
├── backend/
│   ├── app.js, server.js
│   ├── config/db.js
│   ├── controllers/  middleware/  models/  routes/
│   ├── services/signalAnalysisService.js  (core engine)
│   │          /reportPdfService.js, astronomyDataService.js
│   ├── seed/         (seed.js, seedData.js, sampleSignals.js)
│   ├── tests/  utils/  .env  .env.example
└── frontend/
    ├── vite.config.js (proxy /api → :5000)
    └── src/ components/ pages/ pages/admin/ layouts/ context/ services/ hooks/ utils/
```

## Troubleshooting
| Problem | Fix |
|---|---|
| `MongoDB connection error: ECONNREFUSED` | Start MongoDB, or put an Atlas URI in `backend/.env`. |
| Login says "Invalid email or password" | Run `npm run seed` first. |
| Frontend: "Cannot reach the server" | Backend is not running on port 5000. |
| Port already in use | Change `PORT` in `backend/.env` and the proxy target in `frontend/vite.config.js`. |
