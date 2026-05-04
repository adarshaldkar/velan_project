# Underground Cable Fault Detection System - Verification

We have successfully built the complete web application for the Underground Cable Fault Detection System project.

## What was Implemented

### Backend (Node, Express, MongoDB)
- Set up an Express server running on port `5000`.
- Integrated `mongoose` and established a connection to the local `cablefaultdb` database.
- Created the **Fault Schema** to store individual sensor readings (`distance`, `temperature`, `status`, `timestamp`).
- DevelopedREST API endpoints in [routes/faultRoutes.js](file:///C:/Users/shrut/Desktop/Velan%20Project/backend/routes/faultRoutes.js):
  - `POST /api/fault`: Store new fault readings into the database.
  - `GET /api/faults`: Retrieve the entire history of readings.
  - `GET /api/faults/latest`: Get the most recent sensor reading.

### Frontend (React, Vite, Tailwind CSS)
- Initialized a modern Vite+React project running on port `5173`.
- Set up a Vite proxy to allow seamless API calls to the backend on `/api`.
- Developed a dark-themed SCADA-style dashboard with rich styling and modern aesthetics.
- Included several specialized components:
  1. **FaultAlertCard**: Giant flashing alert box matching the active sensor context.
  2. **LiveStatusPanel**: A detailed sidebar showing live temperature gauges and status tags.
  3. **MapView**: An interactive `react-leaflet` map outlining the simulated underground cable between two points in Chennai, drawing a warning marker accurately based on relative distance when a fault is triggered.
  4. **TemperatureChart**: A beautiful gradient line chart generated with `recharts` to map past temperature trends over time.
  5. **FaultHistoryTable**: A history list fetching data from MongoDB to show previously logged system metrics, sorted by latest first.
- The [useFaultData](file:///C:/Users/shrut/Desktop/Velan%20Project/frontend/src/hooks/useFaultData.js#4-34) hook automatically polls the express server every 4 seconds to simulate true IoT behavior without needing socket polling, creating a live sync dashboard.

## Manual Testing Commands

We successfully tested the data ingestion. You can run these commands from the terminal or using Postman to simulate sensor inputs. The frontend dashboard will update automatically within 4 seconds!

### Simulate a "NORMAL" status
```bash
curl -X POST http://localhost:5000/api/fault \
  -H "Content-Type: application/json" \
  -d '{"distance": 0, "temperature": 35, "status": "NORMAL"}'
```

### Simulate a "WARNING" status
```bash
curl -X POST http://localhost:5000/api/fault \
  -H "Content-Type: application/json" \
  -d '{"distance": 110, "temperature": 62, "status": "WARNING"}'
```

### Simulate a Cable "FAULT"
```bash
curl -X POST http://localhost:5000/api/fault \
  -H "Content-Type: application/json" \
  -d '{"distance": 250, "temperature": 85, "status": "FAULT"}'
```

## Running the Project
For future demonstrations, to run the application locally you must run two terminals.

**Terminal 1 (Backend - API & DB)**
```bash
cd "C:\Users\shrut\Desktop\Velan Project\backend"
node server.js
```

**Terminal 2 (Frontend - Dashboard UI)**
```bash
cd "C:\Users\shrut\Desktop\Velan Project\frontend"
npm run dev
```

The application will be accessible at [http://localhost:5173](http://localhost:5173)!

## Video Demonstration

This recording demonstrates the system automatically transitioning from NORMAL status to FAULT status, complete with flashing UI warnings, when a new fault signal is sent via API.
![Dashboard UI Demo Demonstration](C:/Users/shrut/.gemini/antigravity/brain/0f4914c6-e891-41cc-96ad-112a686e52c3/cable_fault_demo_recording_1776922360611.webp)
