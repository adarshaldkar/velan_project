# Hardware-to-Backend Integration Plan

The goal is to connect your ESP32 hardware directly to the Node.js backend we built previously. This will allow the hardware to send live sensor readings (Temperature, Distance, and Status) to the web dashboard, updating the UI automatically.

## User Review Required

> [!IMPORTANT]
> **Network Setup**
> Since the ESP32 and your laptop (running the Node.js backend) will need to communicate, they **must be on the same Wi-Fi network** (e.g., a mobile hotspot). You will need to replace the placeholders `YOUR_WIFI_SSID`, `YOUR_WIFI_PASSWORD`, and `<YOUR_LAPTOP_IP>` in the code with your actual details.

## Proposed Changes to the C++ Code

We will modify the provided Arduino (ESP32) code to include Wi-Fi capabilities and HTTP POST requests, while keeping all existing functionality (LCD, SMS, Relays, Temperature).

### 1. Include Wi-Fi Libraries
Add `#include <WiFi.h>` and `#include <HTTPClient.h>` at the top of the file to enable networking.

### 2. Define Network Credentials & API Endpoint
Add configuration variables for the Wi-Fi credentials and the API URL:
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
String serverName = "http://<YOUR_LAPTOP_IP>:5000/api/fault";
```

### 3. Setup Wi-Fi Connection
In the `setup()` function, initialize the Wi-Fi connection and display the connection status on the LCD.

### 4. Create an HTTP POST Function
We will add a new function `sendDataToBackend(float distance, float temperature, String status)`:
- It will format the data as a JSON string: `{"distance": 12, "temperature": 32.5, "status": "FAULT"}`
- It will send this JSON payload to the Express backend using `HTTPClient`.

### 5. Update the Main Loop Logic
We need to send data to the backend consistently so the dashboard stays "live":
- **NORMAL State**: If no faults and no overheating, periodically send `status: "NORMAL"`, `distance: 0`, and the live `temperature`.
- **OVER HEAT State**: If temperature > 40.0, send `status: "WARNING"` (or "FAULT"), `distance: 0`, and the live `temperature`.
- **CABLE FAULT State**: If any phase (R, Y, or B) detects a fault (`dist > 0`), send `status: "FAULT"`, the calculated `distance`, and the live `temperature`.

We will implement a non-blocking timer (using `millis()`) to send regular updates (e.g., every 5 seconds) without freezing the hardware loop, ensuring SMS alerts can still fire instantly.

## Verification Plan

1. Upload the updated code to the ESP32.
2. Start the Node.js backend (`node server.js`) and React frontend (`npm run dev`).
3. Watch the ESP32 Serial Monitor to confirm it connects to Wi-Fi and successfully sends HTTP POST requests (HTTP Response Code 200/201).
4. Verify that the web dashboard automatically updates its temperature charts and map markers based on the live ESP32 data.
