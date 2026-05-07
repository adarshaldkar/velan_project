#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <HardwareSerial.h>

// ================= Network Credentials =================
const char* ssid = "ANKITA HALDKAR ";         // Added the trailing space that your router requires!
const char* password = "4132957234";          // <--- TYPE YOUR WI-FI PASSWORD HERE
String serverName = "http://192.168.1.6:5005/api/fault"; // Laptop IP on ANKITA network

// ================= LCD =================
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ================= DS18B20 =================
#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// ================= SIM800 =================
HardwareSerial sim800(2);
String phoneNumber = "+919345400590";
bool faultSent = false;

// ================= Relays (Active LOW) =================
int phase[3] = {25, 26, 27}; // R, Y, B
const int ADC_PIN = 34;      // Brown wire from the switch matrix

// ================= Limits =================
float OVER_HEAT_TEMP = 40.0;

// ================= Fault Distances =================
float dist1 = 0;
float dist2 = 0;
float dist3 = 0;

// ================= Timers =================
unsigned long lastPostTime = 0;
unsigned long postInterval = 4000;
int loopCount = 0;

// ========================================================
// Function: Send SMS
// ========================================================
void sendSMS(String msg) {
  Serial.println(">>> [SMS] Sending SMS...");
  sim800.println("AT+CMGF=1");
  delay(500);
  sim800.print("AT+CMGS=\"");
  sim800.print(phoneNumber);
  sim800.println("\"");
  delay(500);
  sim800.print(msg);
  delay(500);
  sim800.write(26); // CTRL+Z
  delay(3000);
  Serial.println(">>> [SMS] SMS command sent.");
}

// ========================================================
// Function: Send to Backend
// ========================================================
void sendDataToBackend(float distance, float temp, String status, String phase) {
  Serial.println("--------------------------------------------------");
  Serial.println(">>> [HTTP] Attempting to send data to backend...");
  Serial.println(">>> [HTTP] Target URL: " + serverName);

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(">>> [HTTP] WiFi OK - building request...");

    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{\"distance\": " + String(distance) +
                         ", \"temperature\": " + String(temp, 2) +
                         ", \"status\": \"" + status + "\"" +
                         ", \"phase\": \"" + phase + "\"}";

    Serial.println(">>> [HTTP] Payload: " + jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(">>> [HTTP] SUCCESS! Response Code: " + String(httpResponseCode));
      Serial.println(">>> [HTTP] Response Body: " + response);
    } else {
      Serial.println(">>> [HTTP] FAILED! Error Code: " + String(httpResponseCode));
      Serial.println(">>> [HTTP] Hint: Check if backend is running and IP is correct.");
      Serial.println(">>> [HTTP] WiFi RSSI (signal strength): " + String(WiFi.RSSI()) + " dBm");
    }
    http.end();
  } else {
    Serial.println(">>> [HTTP] ERROR: WiFi NOT Connected! Skipping HTTP POST.");
    Serial.println(">>> [HTTP] WiFi Status Code: " + String(WiFi.status()));
    Serial.println(">>> [HTTP] Hint: 3=WL_CONNECTED, 1=NO_SSID_AVAIL, 4=CONNECT_FAILED, 6=DISCONNECTED");
  }
  Serial.println("--------------------------------------------------");
}

// ========================================================
// Stop Detection
// ========================================================
void stopDetection() {
  Serial.println(">>> [RELAY] Stopping all phases (Overheat)!");
  for (int i = 0; i < 3; i++) {
    digitalWrite(phase[i], HIGH);
  }
}

// ========================================================
// SETUP
// ========================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("==========================================");
  Serial.println("  UG Cable Fault Detection System");
  Serial.println("  Booting up...");
  Serial.println("==========================================");

  // Relay pins
  Serial.println(">>> [SETUP] Initializing relay pins and ADC...");
  pinMode(ADC_PIN, INPUT);
  for (int i = 0; i < 3; i++) {
    pinMode(phase[i], OUTPUT);
    digitalWrite(phase[i], HIGH); // OFF (active LOW)
    Serial.println(">>> [SETUP] Relay pin " + String(phase[i]) + " set HIGH (OFF)");
  }

  // LCD
  Serial.println(">>> [SETUP] Initializing LCD...");
  lcd.init();
  lcd.backlight();
  lcd.print("UG Cable Fault");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");
  Serial.println(">>> [SETUP] LCD initialized.");

  // WiFi
  Serial.println(">>> [WIFI] Connecting to SSID: " + String(ssid));
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println("");

  lcd.clear();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(">>> [WIFI] ✅ Connected successfully!");
    Serial.println(">>> [WIFI] ESP32 IP Address: " + WiFi.localIP().toString());
    Serial.println(">>> [WIFI] Signal Strength (RSSI): " + String(WiFi.RSSI()) + " dBm");
    lcd.print("WiFi Connected!");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP().toString());
  } else {
    Serial.println(">>> [WIFI] ❌ FAILED to connect to WiFi!");
    Serial.println(">>> [WIFI] WiFi Status Code: " + String(WiFi.status()));
    Serial.println(">>> [WIFI] Hint: 1=NO_SSID_AVAIL (wrong SSID), 4=CONNECT_FAILED (wrong password), 6=DISCONNECTED");
    lcd.print("WiFi FAILED!");
    lcd.setCursor(0, 1);
    lcd.print("Check hotspot");
  }
  delay(2000);
  lcd.clear();

  // Temperature sensor
  Serial.println(">>> [SETUP] Initializing DS18B20 temperature sensor...");
  sensors.begin();
  Serial.println(">>> [SETUP] Temperature sensor initialized.");

  // SIM800
  Serial.println(">>> [SETUP] Initializing SIM800 GSM module...");
  sim800.begin(9600, SERIAL_8N1, 16, 17);
  delay(3000);
  sim800.println("AT");
  delay(1000);
  Serial.println(">>> [SETUP] SIM800 AT command sent.");

  Serial.println("==========================================");
  Serial.println("  Setup complete. Entering main loop...");
  Serial.println("==========================================");
}

// ========================================================
// LOOP
// ========================================================
void loop() {
  loopCount++;
  Serial.println("\n========== LOOP #" + String(loopCount) + " ==========");

  // ---------- Read Temperature ----------
  Serial.println(">>> [TEMP] Requesting temperature...");
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);

  if (tempC == -127.00) {
    Serial.println(">>> [TEMP] ⚠️  ERROR: DS18B20 sensor not found or disconnected! Check wiring on pin " + String(ONE_WIRE_BUS));
  } else {
    Serial.println(">>> [TEMP] Temperature: " + String(tempC, 2) + " °C");
  }

  // ---------- Overheat Protection ----------
  if (tempC > OVER_HEAT_TEMP) {
    Serial.println(">>> [TEMP] 🔥 OVERHEAT DETECTED! (" + String(tempC) + "°C > " + String(OVER_HEAT_TEMP) + "°C)");
    stopDetection();
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("OVER HEAT");
    lcd.setCursor(0, 1);
    lcd.print("DETECTED!");

    if (millis() - lastPostTime >= postInterval) {
      Serial.println(">>> [TEMP] Sending WARNING to backend...");
      sendDataToBackend(0, tempC, "WARNING", "ALL");
      lastPostTime = millis();
    }
    return;
  }

  // ---------- Fault logic ----------
  bool faultDetected = false;
  String faultMsg = "";
  String faultPhase = "NONE";
  float currentFaultDistance = 0;

  // ===== R PHASE =====
  Serial.println(">>> [PHASE] Checking R Phase (Pin " + String(phase[0]) + ")...");
  lcd.clear();
  lcd.print("Checking R");
  digitalWrite(phase[0], LOW);
  delay(200);

  int adcR = analogRead(ADC_PIN);
  if (adcR < 4000) { dist1 = map(adcR, 0, 4000, 50, 480); } else { dist1 = 0; }
  Serial.println(">>> [PHASE] R Phase distance reading: " + String(dist1));
  if (dist1 > 0) {
    faultDetected = true;
    currentFaultDistance = dist1;
    faultPhase = "R";
    faultMsg = "R phase fault at " + String(dist1) + " M";
    Serial.println(">>> [PHASE] ⚡ FAULT detected on R Phase!");
  } else {
    Serial.println(">>> [PHASE] R Phase OK.");
  }
  digitalWrite(phase[0], HIGH);
  delay(500);

  // ===== Y PHASE =====
  Serial.println(">>> [PHASE] Checking Y Phase (Pin " + String(phase[1]) + ")...");
  lcd.clear();
  lcd.print("Checking Y");
  digitalWrite(phase[1], LOW);
  delay(200);

  int adcY = analogRead(ADC_PIN);
  if (adcY < 4000) { dist2 = map(adcY, 0, 4000, 50, 480); } else { dist2 = 0; }
  Serial.println(">>> [PHASE] Y Phase distance reading: " + String(dist2));
  if (dist2 > 0 && !faultDetected) {
    faultDetected = true;
    currentFaultDistance = dist2;
    faultPhase = "Y";
    faultMsg = "Y phase fault at " + String(dist2) + " M";
    Serial.println(">>> [PHASE] ⚡ FAULT detected on Y Phase!");
  } else {
    Serial.println(">>> [PHASE] Y Phase OK (or R already faulted).");
  }
  digitalWrite(phase[1], HIGH);
  delay(500);

  // ===== B PHASE =====
  Serial.println(">>> [PHASE] Checking B Phase (Pin " + String(phase[2]) + ")...");
  lcd.clear();
  lcd.print("Checking B");
  digitalWrite(phase[2], LOW);
  delay(200);

  int adcB = analogRead(ADC_PIN);
  if (adcB < 4000) { dist3 = map(adcB, 0, 4000, 50, 480); } else { dist3 = 0; }
  Serial.println(">>> [PHASE] B Phase distance reading: " + String(dist3));
  if (dist3 > 0 && !faultDetected) {
    faultDetected = true;
    currentFaultDistance = dist3;
    faultPhase = "B";
    faultMsg = "B phase fault at " + String(dist3) + " M";
    Serial.println(">>> [PHASE] ⚡ FAULT detected on B Phase!");
  } else {
    Serial.println(">>> [PHASE] B Phase OK (or earlier phase already faulted).");
  }
  digitalWrite(phase[2], HIGH);
  delay(500);

  // ---------- Summary ----------
  lcd.clear();
  if (faultDetected) {
    Serial.println(">>> [STATUS] *** FAULT DETECTED: " + faultMsg + " ***");
    lcd.setCursor(0, 0);
    lcd.print(faultPhase + "-Fault @ " + String(currentFaultDistance, 0) + "m");
    lcd.setCursor(0, 1);
    lcd.print("Temp: " + String(tempC, 1) + " C");
  } else {
    Serial.println(">>> [STATUS] All phases NORMAL. No fault detected.");
    lcd.setCursor(0, 0);
    lcd.print("System Normal");
    lcd.setCursor(0, 1);
    lcd.print("Temp: " + String(tempC, 1) + " C");
  }
  delay(1500); // Hold the message on screen so it can be read

  // ---------- SMS Logic ----------
  if (faultDetected && !faultSent) {
    Serial.println(">>> [SMS] First fault occurrence - sending SMS alert...");
    lcd.clear();
    lcd.print("FAULT FOUND");
    lcd.setCursor(0, 1);
    lcd.print("Sending SMS");
    sendSMS("UG Cable Fault!\n" + faultMsg);
    faultSent = true;
    Serial.println(">>> [SMS] faultSent flag set to TRUE. No more SMS until fault clears.");
  }

  if (!faultDetected) {
    if (faultSent) {
      Serial.println(">>> [SMS] Fault cleared. Resetting faultSent flag.");
    }
    faultSent = false;
  }

  // ---------- Backend Upload ----------
  unsigned long now = millis();
  unsigned long timeUntilPost = (now - lastPostTime >= postInterval) ? 0 : (postInterval - (now - lastPostTime));
  Serial.println(">>> [TIMER] Time until next POST: " + String(timeUntilPost) + " ms");

  if (now - lastPostTime >= postInterval) {
    if (faultDetected) {
      sendDataToBackend(currentFaultDistance, tempC, "FAULT", faultPhase);
    } else {
      sendDataToBackend(0, tempC, "NORMAL", "NONE");
    }
    lastPostTime = millis();
  }
}
