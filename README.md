# Underground Cable Fault Detection System

An end-to-end monitoring solution for detecting, logging, and visualizing underground cable faults. The project combines an Arduino microcontroller firmware component with a Node.js Express backend and a React dashboard featuring real-time telemetry updates, temperature trend charting, phase status matrixes, and interactive map visualizations.

## Table of Contents

- [Features](#features)
- [Configuration](#configuration)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)

## Features

- **Real-Time Telemetry & Alerts**: Automated polling loop fetches fault logs and live status updates every 4000 ms.
- **Phase Monitoring**: Tracks individual phase status (`R`, `Y`, `B`, `ALL`, or `NONE`) along with fault presence and historical phase state.
- **Interactive Map**: Displays cable routes, endpoints, and detected fault locations on a Leaflet map.
- **Thermal Analytics**: Recharts area chart plots historical core temperatures against a critical 70°C threshold.
- **Historical Fault Logs**: Sortable and paginated table tracking fault timestamps, depth distances, temperatures, phases, and status classifications (`FAULT`, `WARNING`, `NORMAL`).
- **Hardware Integration**: Arduino C++ firmware (`CableFaultSystem.ino`) configured with ADC logic and LCD status output.

## Configuration

Configure environment variables in a `.env` file in the `backend/` directory before starting the backend server:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

*Note: The frontend Vite development server (`frontend/vite.config.js`) proxies requests from `/api` to `http://localhost:5005`.*

## Installation

### Backend Prerequisites & Setup

Navigate to the `backend` folder and install dependencies:

```bash
cd backend
npm install
```

### Frontend Prerequisites & Setup

Navigate to the `frontend` folder and install dependencies:

```bash
cd frontend
npm install
```

## Usage

### Running the Backend

Seed the MongoDB database with sample fault data (optional):

```bash
cd backend
node seed.js
```

Start the backend server in development mode using `nodemon`:

```bash
cd backend
npm run dev
```

Start the backend server in production mode:

```bash
cd backend
npm start
```

### Running the Frontend

Start the Vite development server:

```bash
cd frontend
npm run dev
```

Build the static production assets:

```bash
cd frontend
npm run build
```

Preview the production build locally:

```bash
cd frontend
npm run preview
```

Run ESLint code verification:

```bash
cd frontend
npm run lint
```

### Hardware Firmware

Open `hardware/CableFaultSystem/CableFaultSystem.ino` in the Arduino IDE to compile and flash the microcontroller code.

## API Reference

### Health Check

```http
GET /
```

Response:
```json
{
  "message": "Cable Fault Detection API is running 🟢"
}
```

### Save Fault Record

```http
POST /api/fault
```

Request Body:

| Field | Type | Required | Allowed Values | Description |
| :--- | :--- | :--- | :--- | :--- |
| `distance` | Number | Yes | Numeric values | Fault distance in meters |
| `temperature` | Number | Yes | Numeric values | Cable core temperature in °C |
| `status` | String | Yes | `"FAULT"`, `"WARNING"`, `"NORMAL"` | System status classification |
| `phase` | String | No | `"R"`, `"Y"`, `"B"`, `"ALL"`, `"NONE"` | Phase identifier (default: `"NONE"`) |

Response (`201 Created`):
```json
{
  "message": "Fault record saved",
  "fault": {
    "distance": 185,
    "temperature": 78,
    "status": "FAULT",
    "phase": "R",
    "_id": "...",
    "timestamp": "2026-03-31T00:00:00.000Z"
  }
}
```

### Get All Fault Records

```http
GET /api/faults
```

Returns an array of all recorded faults sorted by timestamp in descending order.

### Get Latest Fault Record

```http
GET /api/faults/latest
```

Returns the single most recent fault record or a `404 Not Found` response if no records exist.

## Project Structure

```
.
├── backend/
│   ├── models/
│   │   └── Fault.js         # Mongoose schema for fault records
│   ├── routes/
│   │   └── faultRoutes.js   # Express REST endpoints
│   ├── package.json         # Backend dependencies and scripts
│   ├── seed.js              # Database seed script with sample data
│   └── server.js            # Express application server and Socket.io setup
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client functions
│   │   ├── components/      # UI components (Map, Alert, Tables, Charts)
│   │   ├── hooks/           # Data polling hook (useFaultData)
│   │   ├── App.jsx          # Dashboard view layout
│   │   └── main.jsx         # React application entry point
│   ├── package.json         # Frontend dependencies and scripts
│   └── vite.config.js       # Vite configuration with backend proxy
└── hardware/
    └── CableFaultSystem/
        └── CableFaultSystem.ino # Arduino source code with ADC and LCD integration
```