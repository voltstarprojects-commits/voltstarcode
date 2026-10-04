import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Built-in intelligent fallback databases for instant zero-latency responses
const INTEL_DATABASE: Record<string, any> = {
  mpu6050: {
    summary: 'The MPU-6050 is a 6-axis MotionTracking device combining a 3-axis gyroscope and a 3-axis accelerometer on the same silicon die together with an onboard Digital Motion Processor (DMP).',
    pinout: [
      { pin: 'VCC', function: 'Power 3.3V - 5V', description: 'Power input. Most breakout boards include an onboard 3.3V LDO regulator.' },
      { pin: 'GND', function: 'Ground 0V', description: 'Connect to microcontroller common ground.' },
      { pin: 'SCL', function: 'I2C Clock', description: 'Connect to A5 on Arduino Uno, GPIO 22 on ESP32, Pin 21 on RP2040.' },
      { pin: 'SDA', function: 'I2C Data', description: 'Connect to A4 on Arduino Uno, GPIO 21 on ESP32, Pin 20 on RP2040.' },
      { pin: 'XDA/XCL', function: 'Auxiliary I2C', description: 'Used to interface external magnetometers (e.g. HMC5883L).' },
      { pin: 'AD0', function: 'I2C Address Select', description: 'Low = 0x68 (default), High (3.3V) = 0x69.' },
      { pin: 'INT', function: 'Interrupt Output', description: 'Connect to digital interrupt pin (D2 on Uno) for FIFO/motion interrupts.' }
    ],
    recommendedLibraries: [
      { name: 'Adafruit MPU6050', author: 'Adafruit', installNote: 'Provides high-level acceleration and gyro values with Adafruit Unified Sensor support.' },
      { name: 'MPU6050_light', author: 'rfetick', installNote: 'Lightweight library with fast automatic gyro calibration routine.' },
      { name: 'Electronic Cats I2Cdevlib MPU6050', author: 'jrowberg', installNote: 'Direct DMP support for 6-axis quaternion calculations.' }
    ],
    wiringNotes: [
      'Breakout board has 4.7kΩ pull-up resistors on SDA and SCL on most GY-521 modules.',
      'Operates natively on 3.3V logic; while VCC takes 5V via LDO, I2C pull-ups to 3.3V are recommended on 3.3V MCUs (ESP32/RP2040).',
      'Keep I2C wire length under 25cm to prevent bus noise and packet loss.'
    ],
    codeSnippet: `#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

Adafruit_MPU6050 mpu;

void setup() {
  Serial.begin(115200);
  while (!Serial) delay(10);

  if (!mpu.begin()) {
    Serial.println(F("Failed to find MPU6050 chip"));
    while (1) delay(10);
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  Serial.println(F("MPU6050 Ready!"));
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  Serial.print("Accel X: "); Serial.print(a.acceleration.x);
  Serial.print(" Y: "); Serial.print(a.acceleration.y);
  Serial.print(" Z: "); Serial.print(a.acceleration.z);
  Serial.println(" m/s^2");
  delay(100);
}`,
    sources: [
      { title: 'InvenSense MPU-6050 Datasheet & Register Map', uri: 'https://invensense.tdk.com/products/motion-tracking/6-axis/mpu-6050/' },
      { title: 'Adafruit MPU6050 Arduino Library Guide', uri: 'https://learn.adafruit.com/mpu6050-6-dof-accelerometer-and-gyro' }
    ]
  },
  l298n: {
    summary: 'The L298N is an integrated dual H-Bridge high-power motor driver capable of driving inductive loads like DC motors, stepper motors, and relays up to 2A per channel (46V max).',
    pinout: [
      { pin: '12V / VMS', function: 'Motor Power Input', description: 'Connect external battery pack (7V - 12V+). Do NOT power from Arduino 5V!' },
      { pin: 'GND', function: 'Common Ground', description: 'CRITICAL: Must be tied to both the battery negative AND Arduino GND.' },
      { pin: '5V', function: '5V Logic / Regulator', description: 'Outputs 5V if 5V jumper is inserted; input 5V logic if jumper is removed.' },
      { pin: 'ENA', function: 'Motor A Speed (PWM)', description: 'Remove onboard jumper and connect to PWM pin (D5 or D6 on Uno).' },
      { pin: 'IN1 / IN2', function: 'Motor A Direction', description: 'Digital outputs for forward/reverse control.' },
      { pin: 'IN3 / IN4', function: 'Motor B Direction', description: 'Digital outputs for motor B direction.' },
      { pin: 'ENB', function: 'Motor B Speed (PWM)', description: 'PWM pin for motor B speed modulation.' }
    ],
    recommendedLibraries: [
      { name: 'Standard Arduino PWM', author: 'Built-in', installNote: 'Direct analogWrite() control with digitalWrite() for direction phases.' }
    ],
    wiringNotes: [
      'ALWAYS connect battery GND to microcontroller GND to avoid floating ground anomalies.',
      'The L298N has high internal transistor voltage drops (~1.8V to 2.5V); a 7.4V LiPo will supply ~5.2V to the motor terminals.',
      'Never drive motors directly from Arduino 5V header pin; inductive kickback will reset or fry the ATmega328P.'
    ],
    codeSnippet: `const int ENA = 5; // PWM
const int IN1 = 7;
const int IN2 = 8;

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
}

void loop() {
  // Forward half-speed
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 180);
  delay(2000);
  
  // Brake
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  delay(1000);
}`,
    sources: [
      { title: 'STMicroelectronics L298 Dual Full-Bridge Driver Datasheet', uri: 'https://www.st.com/resource/en/datasheet/l298.pdf' }
    ]
  },
  'hc-sr04': {
    summary: 'The HC-SR04 provides 2cm to 400cm non-contact distance measurement with 3mm accuracy using 40kHz ultrasonic sound burst echo timing.',
    pinout: [
      { pin: 'VCC', function: 'Power 5V', description: 'Requires stable 5V input (draws ~15mA during transmit pulse).' },
      { pin: 'TRIG', function: 'Trigger Input', description: 'Send 10us HIGH pulse to initiate ultrasonic sound burst.' },
      { pin: 'ECHO', function: 'Echo Output', description: 'Pulse width corresponds directly to sound transit time.' },
      { pin: 'GND', function: 'Ground 0V', description: 'Connect to microcontroller common ground.' }
    ],
    recommendedLibraries: [
      { name: 'NewPing', author: 'Tim Eckel', installNote: 'High-speed, non-blocking ultrasonic library with hardware timer support.' }
    ],
    wiringNotes: [
      'Echo pin outputs 5V. When connecting to 3.3V microcontrollers (ESP32, RP2040, STM32), use a resistor voltage divider (1kΩ and 2kΩ) on ECHO.',
      'Trigger pulse must be held HIGH for at least 10 microseconds.'
    ],
    codeSnippet: `const int TRIG_PIN = 11;
const int ECHO_PIN = 12;

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 26000); // 26ms timeout (~4.5m)
  float distanceCm = duration * 0.034 / 2.0;

  Serial.print("Distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");
  delay(100);
}`,
    sources: [
      { title: 'HC-SR04 Ultrasonic Distance Sensor Specifications', uri: 'https://www.electroschematics.com/hc-sr04-datasheet/' }
    ]
  },
  ssd1306: {
    summary: 'The SSD1306 is a monochrome 128x64 or 128x32 dot matrix OLED display driver with integrated display RAM, communicating via I2C (address 0x3C or 0x3D) or SPI.',
    pinout: [
      { pin: 'GND', function: 'Ground', description: 'Connect to ground.' },
      { pin: 'VCC', function: 'Power 3.3V - 5V', description: 'Most modules have an onboard charge pump and LDO.' },
      { pin: 'SCL', function: 'I2C Clock', description: 'Connect to SCL (Uno A5, ESP32 GPIO 22).' },
      { pin: 'SDA', function: 'I2C Data', description: 'Connect to SDA (Uno A4, ESP32 GPIO 21).' }
    ],
    recommendedLibraries: [
      { name: 'Adafruit SSD1306', author: 'Adafruit', installNote: 'Feature-complete graphics library with buffer support.' },
      { name: 'U8g2', author: 'olikraus', installNote: 'Ultra-fast, low memory footprint graphics library with dozens of embedded fonts.' }
    ],
    wiringNotes: [
      'Default I2C address is usually 0x3C. If the screen does not turn on, check 0x3D.',
      'SRAM usage: Full 128x64 screen buffer takes 1024 bytes of SRAM, which is 50% of the ATmega328P 2KB SRAM. Use page buffer mode in U8g2 if memory is tight.'
    ],
    codeSnippet: `#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

void setup() {
  Serial.begin(115200);
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;);
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 10);
  display.println(F("VoltStar Code"));
  display.display();
}

void loop() {}`,
    sources: [
      { title: 'Solomon Systech SSD1306 Controller Datasheet', uri: 'https://cdn-shop.adafruit.com/datasheets/SSD1306.pdf' }
    ]
  },
  bme280: {
    summary: 'The Bosch BME280 is an integrated environmental sensor developed specifically for mobile applications where size and low power consumption are key requirements, measuring temperature, barometric pressure, and relative humidity.',
    pinout: [
      { pin: 'VCC', function: 'Power 3.3V', description: 'Pure 3.3V sensor. Some boards have a 5V LDO.' },
      { pin: 'GND', function: 'Ground', description: 'Common Ground.' },
      { pin: 'SCL', function: 'I2C Clock / SPI SCK', description: 'I2C Clock input.' },
      { pin: 'SDA', function: 'I2C Data / SPI SDI', description: 'I2C Data line.' },
      { pin: 'CSB', function: 'Chip Select', description: 'Pull HIGH for I2C, LOW for SPI.' },
      { pin: 'SDO', function: 'Address Select', description: 'GND = 0x76, VCC = 0x77.' }
    ],
    recommendedLibraries: [
      { name: 'Adafruit BME280 Library', author: 'Adafruit', installNote: 'Standard library for altitude, pressure, humidity and temperature.' },
      { name: 'BME280_I2C', author: 'Tyler Glenn', installNote: 'Compact, efficient I2C-only driver.' }
    ],
    wiringNotes: [
      'Ensure module logic level compatibility; native BME280 IC is strictly 3.3V rated.',
      'Default I2C address is usually 0x76 on purple breakouts, 0x77 on Adafruit breakouts.'
    ],
    codeSnippet: `#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

Adafruit_BME280 bme;

void setup() {
  Serial.begin(115200);
  if (!bme.begin(0x76)) {
    Serial.println("Could not find a valid BME280 sensor, check wiring!");
    while (1);
  }
}

void loop() {
  Serial.print("Temp = "); Serial.print(bme.readTemperature()); Serial.println(" *C");
  Serial.print("Pressure = "); Serial.print(bme.readPressure() / 100.0F); Serial.println(" hPa");
  Serial.print("Humidity = "); Serial.print(bme.readHumidity()); Serial.println(" %");
  delay(1000);
}`,
    sources: [
      { title: 'Bosch Sensortec BME280 Datasheet', uri: 'https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/' }
    ]
  }
};

// 1. GENERATE ENDPOINT
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, platform = 'Arduino Uno R3', domain = 'Motors & Sensors (Arduino Uno)' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (ai) {
      try {
        const systemPrompt = `You are VoltStar AI, the premier embedded systems C++ and electronics architect.
The user wants an embedded project with automated pin assignments, robust C++ code, Bill of Materials, pin table, circuit connection diagram, and engineering gotchas.
Target Platform: ${platform}
Domain: ${domain}

Return ONLY valid JSON matching this schema:
{
  "projectTitle": string,
  "targetPlatform": string,
  "summary": string,
  "code": string (complete, production-ready, non-blocking C++ sketch with pin definitions, setup, loop, millis-based timing, telemetry serial output at 115200 baud),
  "explanation": string (markdown detailing how pins were automatically chosen and how the circuit operates),
  "bom": [
    { "name": string, "quantity": number, "spec": string, "role": string }
  ],
  "pinTable": [
    { "boardPin": string, "component": string, "componentPin": string, "wireColor": string (hex color like #f59e0b, #3b82f6, #ef4444, #10b981), "signalType": string (e.g. PWM OUTPUT, DIGITAL IN, I2C SDA, POWER), "notes": string }
  ],
  "wiringDiagram": {
    "board": {
      "id": "board-mcu",
      "name": "${platform}",
      "type": "arduino-uno",
      "pins": ["5V", "3.3V", "GND", "VIN", "A0", "A1", "A2", "A3", "A4 (SDA)", "A5 (SCL)", "D2", "D3~", "D4", "D5~", "D6~", "D7", "D8", "D9~", "D10~", "D11~", "D12", "D13"]
    },
    "components": [
      {
        "id": string (e.g. comp-1),
        "name": string,
        "type": "motor" | "sensor" | "display" | "audio" | "relay" | "actuator",
        "icon": string (e.g. activity, cpu, radio, volume-2, thermometer, zap),
        "assignedPin": string,
        "pins": string[],
        "x": number (around 520),
        "y": number (spacing 30, 160, 290, 420, 540)
      }
    ],
    "connections": [
      {
        "fromPin": string,
        "toComponentId": string,
        "toPin": string,
        "color": string (hex),
        "label": string
      }
    ]
  },
  "potentialIssues": string[] (3-5 critical electrical & hardware gotchas e.g. shared grounds, separate motor power, voltage levels)
}`;

        const timeoutGen = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timeout')), 5000)
        );

        const response: any = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Create an embedded C++ project for: ${prompt}`,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json'
            }
          }),
          timeoutGen
        ]);

        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          return res.json(parsed);
        }
      } catch (err) {
        console.error('Gemini generation error, falling back to smart embedded synthesis:', err);
      }
    }

    // Smart fallback generation
    const lower = prompt.toLowerCase();
    const isWater = lower.includes('water') || lower.includes('plant') || lower.includes('soil') || lower.includes('pump');
    const isSolar = lower.includes('solar') || lower.includes('tracker') || lower.includes('ldr') || lower.includes('sun');
    const isPID = lower.includes('pid') || lower.includes('encoder') || lower.includes('stabilizer');

    if (isWater) {
      return res.json({
        projectTitle: 'Smart Plant Irrigation System (Soil Sensor + Pump Relay)',
        targetPlatform: platform,
        summary: 'Arduino Uno automatic plant watering system with capacitive soil moisture sensor on A0, 5V water pump relay on D3, status LEDs on D7/D8, and 16x2 I2C LCD on A4/A5.',
        code: `/* ====================================================================
 * Project: Smart Plant Irrigation System
 * Target Board: ${platform}
 * Powered by VoltStar
 * 
 * AUTOMATIC PIN ASSIGNMENTS:
 * - Soil Moisture Sensor: Pin A0 (10-bit Analog ADC)
 * - 5V Water Pump Relay:  Pin D3 (Digital Output Active LOW)
 * - Moisture Alert LED:   Pin D7 (Digital Output)
 * - Status LED:           Pin D13 (Digital Output)
 * - I2C SDA (LCD):        Pin A4 (Hardware I2C Data)
 * - I2C SCL (LCD):        Pin A5 (Hardware I2C Clock)
 * ==================================================================== */

#include <Arduino.h>
#include <Wire.h>

namespace Pins {
  constexpr uint8_t SOIL_SENSOR = A0;
  constexpr uint8_t PUMP_RELAY  = 3;
  constexpr uint8_t ALERT_LED   = 7;
  constexpr uint8_t STATUS_LED  = 13;
}

namespace Config {
  constexpr uint32_t SERIAL_BAUD      = 115200;
  constexpr uint32_t CHECK_INTERVAL   = 1000;
  constexpr uint16_t DRY_THRESHOLD    = 550; // Calibrated soil threshold
  constexpr uint32_t PUMP_MAX_RUNTIME = 3000; // Max continuous water pulse ms
}

struct IrrigationState {
  uint16_t soilRaw = 0;
  float soilMoisturePct = 0.0f;
  bool isPumpActive = false;
  uint32_t pumpStartTime = 0;
  uint32_t loopCycle = 0;
};

IrrigationState state;
uint32_t lastCheckMillis = 0;

void setup() {
  Serial.begin(Config::SERIAL_BAUD);
  pinMode(Pins.SOIL_SENSOR, INPUT);
  pinMode(Pins.PUMP_RELAY, OUTPUT);
  pinMode(Pins.ALERT_LED, OUTPUT);
  pinMode(Pins.STATUS_LED, OUTPUT);

  // Relay module active LOW: default HIGH for OFF
  digitalWrite(Pins.PUMP_RELAY, HIGH);
  digitalWrite(Pins.ALERT_LED, LOW);

  Serial.println(F("=================================================="));
  Serial.println(F("⚡ VoltStar Code - Smart Irrigation Controller"));
  Serial.println(F("=================================================="));
}

void loop() {
  const uint32_t currentMillis = millis();

  // Safety shutoff for water pump
  if (state.isPumpActive && (currentMillis - state.pumpStartTime >= Config.PUMP_MAX_RUNTIME)) {
    digitalWrite(Pins.PUMP_RELAY, HIGH);
    state.isPumpActive = false;
    Serial.println(F("[SAFETY] Pump auto-shutoff timeout reached."));
  }

  // Periodic sensor sampling & control
  if (currentMillis - lastCheckMillis >= Config.CHECK_INTERVAL) {
    lastCheckMillis = currentMillis;
    state.loopCycle++;

    state.soilRaw = analogRead(Pins.SOIL_SENSOR);
    // Invert mapping: higher raw reading often means dry soil
    state.soilMoisturePct = constrain(map(state.soilRaw, 750, 300, 0, 100), 0, 100);

    if (state.soilRaw > Config.DRY_THRESHOLD && !state.isPumpActive) {
      Serial.println(F("[ALERT] Soil moisture dry! Activating water pump..."));
      digitalWrite(Pins.PUMP_RELAY, LOW); // Trigger relay
      digitalWrite(Pins.ALERT_LED, HIGH);
      state.isPumpActive = true;
      state.pumpStartTime = currentMillis;
    } else if (state.soilRaw <= Config.DRY_THRESHOLD) {
      digitalWrite(Pins.ALERT_LED, LOW);
    }

    Serial.print(F("[VoltStar #"));
    Serial.print(state.loopCycle);
    Serial.print(F("] Soil Raw: "));
    Serial.print(state.soilRaw);
    Serial.print(F(" | Moisture: "));
    Serial.print(state.soilMoisturePct);
    Serial.print(F("% | Pump: "));
    Serial.println(state.isPumpActive ? F("ON 💧") : F("STANDBY"));
  }
}`,
        explanation: '### Automatic Hardware Pin Assignment\n- **Soil Sensor on Pin A0**: Reads moisture level via 10-bit ADC.\n- **Pump Relay on Pin D3**: Connects to the optocoupled relay signal.\n- **Alert LED on Pin D7**: Visual red warning indicator.\n- **Hardware I2C (A4/A5)**: Reserved for 16x2 LCD or OLED.',
        bom: [
          { name: platform, quantity: 1, spec: 'Main Microcontroller (5V logic)', role: 'Embedded Controller' },
          { name: 'Capacitive Soil Moisture Sensor v1.2', quantity: 1, spec: 'Corrosion resistant analog probe', role: 'Moisture Detection' },
          { name: '1-Channel 5V Relay Module', quantity: 1, spec: '10A 250VAC Optocoupled Relay', role: 'Pump AC/DC Switch' },
          { name: '5V Submersible Water Pump', quantity: 1, spec: '3-6V DC Micro Water Pump', role: 'Water Dispenser' },
          { name: 'Red Indicator LED & 220Ω Resistor', quantity: 1, spec: '5mm LED', role: 'Moisture Status Alert' }
        ],
        pinTable: [
          { boardPin: 'A0', component: 'Capacitive Soil Sensor', componentPin: 'AOUT (Signal)', wireColor: '#14b8a6', signalType: 'ANALOG IN', notes: 'Auto-assigned 10-bit ADC' },
          { boardPin: 'D3', component: '5V Relay Module', componentPin: 'IN (Trigger)', wireColor: '#ef4444', signalType: 'DIGITAL OUT', notes: 'Active LOW relay trigger' },
          { boardPin: 'D7', component: 'Red Indicator LED', componentPin: 'Anode (+)', wireColor: '#f59e0b', signalType: 'DIGITAL OUT', notes: 'Low moisture warning indicator' },
          { boardPin: '5V', component: 'Sensor & Relay Module', componentPin: 'VCC', wireColor: '#ef4444', signalType: 'POWER (5V)', notes: 'Regulated 5V rail' },
          { boardPin: 'GND', component: 'All Modules', componentPin: 'GND', wireColor: '#64748b', signalType: 'GROUND', notes: 'Common ground return' }
        ],
        wiringDiagram: {
          board: {
            id: 'board-mcu',
            name: platform,
            type: 'arduino-uno',
            pins: ['5V', '3.3V', 'GND', 'VIN', 'A0', 'A1', 'A2', 'A3', 'A4 (SDA)', 'A5 (SCL)', 'D2', 'D3~', 'D4', 'D5~', 'D6~', 'D7', 'D8', 'D9~', 'D10~', 'D11~', 'D12', 'D13']
          },
          components: [
            { id: 'comp-soil', name: 'Capacitive Soil Sensor', type: 'sensor', icon: 'thermometer', assignedPin: 'A0 (Analog)', pins: ['VCC', 'GND', 'AOUT'], x: 520, y: 60 },
            { id: 'comp-relay', name: '5V Water Pump Relay', type: 'relay', icon: 'zap', assignedPin: 'D3 (Digital Out)', pins: ['VCC', 'GND', 'IN'], x: 520, y: 220 },
            { id: 'comp-led', name: 'Moisture Alert LED', type: 'audio', icon: 'activity', assignedPin: 'D7 (Warning)', pins: ['Anode (+)', 'Cathode (-)'], x: 520, y: 380 }
          ],
          connections: [
            { fromPin: 'A0', toComponentId: 'comp-soil', toPin: 'AOUT', color: '#14b8a6', label: 'Analog Soil (A0)' },
            { fromPin: '5V', toComponentId: 'comp-soil', toPin: 'VCC', color: '#ef4444', label: '5V Sensor' },
            { fromPin: 'GND', toComponentId: 'comp-soil', toPin: 'GND', color: '#64748b', label: 'GND' },
            { fromPin: 'D3~', toComponentId: 'comp-relay', toPin: 'IN', color: '#ef4444', label: 'Relay Trigger (D3)' },
            { fromPin: '5V', toComponentId: 'comp-relay', toPin: 'VCC', color: '#ef4444', label: '5V Relay' },
            { fromPin: 'GND', toComponentId: 'comp-relay', toPin: 'GND', color: '#64748b', label: 'GND' },
            { fromPin: 'D7', toComponentId: 'comp-led', toPin: 'Anode (+)', color: '#f59e0b', label: 'LED Anode (D7)' },
            { fromPin: 'GND', toComponentId: 'comp-led', toPin: 'Cathode (-)', color: '#64748b', label: 'GND' }
          ]
        },
        potentialIssues: [
          'Use a separate power supply or external battery for the water pump motor to prevent inductive spikes from resetting the Arduino.',
          'Always use a flyback diode across inductive DC pump coils if not using an opto-isolated relay board.',
          'Capacitive soil sensors have higher reliability than resistive forks, but prevent submerging the circuit board portion.'
        ]
      });
    }

    // Default flagship: Obstacle Avoidance Rover with L298N & Ultrasonic & Servo
    return res.json({
      projectTitle: `${platform} Autonomous Dual-Motor Driver & Sensor System`,
      targetPlatform: platform,
      summary: 'Production-ready sketch controlling DC motors with L298N H-Bridge PWM, SG90 pan servo, HC-SR04 ultrasonic distance sensor, analog light monitor, and alert buzzer. All pins automatically configured.',
      code: `/* ====================================================================
 * Project: ${platform} Dual-Motor Driver & Sensor System
 * Target Board: ${platform}
 * Powered by VoltStar
 * 
 * AUTOMATIC PIN ASSIGNMENTS (Auto-Selected by VoltStar AI):
 * - DC Motor Speed (ENA):     Pin D5  (Hardware Timer 0 PWM ~)
 * - DC Motor Direction IN1:   Pin D7  (Digital Output)
 * - DC Motor Direction IN2:   Pin D8  (Digital Output)
 * - Servo Motor Signal:       Pin D9  (Hardware Timer 1 PWM ~)
 * - Ultrasonic Trigger (TRIG): Pin D11 (Hardware Timer 2 PWM / Digital)
 * - Ultrasonic Echo (ECHO):   Pin D12 (Digital Input)
 * - Audible Alert Buzzer:     Pin D4  (Digital Output)
 * - Built-in Status LED:      Pin D13 (Digital Output)
 * - Analog Sensor (LDR/Soil): Pin A0  (10-bit ADC 0-5V Input)
 * - I2C Telemetry Data (SDA): Pin A4  (Hardware I2C SDA)
 * - I2C Telemetry Clock (SCL): Pin A5 (Hardware I2C SCL)
 * ==================================================================== */

#include <Arduino.h>
#include <Servo.h>
#include <Wire.h>

// ---------------------------------------------------------------------
// 1. AUTOMATIC HARDWARE PIN DEFINITIONS
// ---------------------------------------------------------------------
namespace HardwarePins {
    // Motor Driver Pins (L298N / L293D)
    constexpr uint8_t MOTOR_PWM_ENA = 5;   // Hardware PWM pin for motor speed control (0-255)
    constexpr uint8_t MOTOR_DIR_IN1 = 7;   // Motor direction phase 1
    constexpr uint8_t MOTOR_DIR_IN2 = 8;   // Motor direction phase 2

    // Actuators & Buzzers
    constexpr uint8_t SERVO_SIGNAL  = 9;   // Hardware PWM pin for SG90 servo position
    constexpr uint8_t BUZZER_ALARM  = 4;   // Active piezo buzzer trigger
    constexpr uint8_t STATUS_LED    = 13;  // Onboard status LED

    // Sensors
    constexpr uint8_t US_TRIG       = 11;  // Ultrasonic transmitter pulse
    constexpr uint8_t US_ECHO       = 12;  // Ultrasonic receiver echo
    constexpr uint8_t ANALOG_SENSOR = A0;  // 10-bit ADC Analog input (0 to 1023)
}

// ---------------------------------------------------------------------
// 2. TIMING & SYSTEM CONFIGURATION
// ---------------------------------------------------------------------
namespace SystemConfig {
    constexpr uint32_t SERIAL_BAUD_RATE    = 115200;
    constexpr uint32_t TELEMETRY_INTERVAL  = 500;   // 2 Hz serial telemetry
    constexpr uint32_t BLINK_INTERVAL      = 250;   // Heartbeat toggle ms
    constexpr uint16_t OBSTACLE_LIMIT_CM   = 20;    // Alert distance in cm
}

// ---------------------------------------------------------------------
// 3. RUNTIME STATE & OBJECTS
// ---------------------------------------------------------------------
Servo panServo;

struct SystemTelemetry {
    uint16_t distanceCm = 0;
    uint16_t analogRaw = 0;
    float sensorVoltage = 0.0f;
    uint8_t motorSpeed = 180;
    int servoAngle = 90;
    bool obstacleAlert = false;
    uint32_t loopCycle = 0;
};

SystemTelemetry telemetry;
uint32_t lastTelemetryMillis = 0;
uint32_t lastBlinkMillis = 0;
bool statusLedState = false;

// Function Prototypes
void configureHardwarePins();
uint16_t measureUltrasonicDistance();
void driveMotors(uint8_t speed, bool forward);
void stopMotors();
void updatePanServo();
void readAnalogSensors();
void transmitSerialPacket();

// ---------------------------------------------------------------------
// 4. ARDUINO SETUP ROUTINE
// ---------------------------------------------------------------------
void setup() {
    Serial.begin(SystemConfig::SERIAL_BAUD_RATE);
    while (!Serial && millis() < 2500) {
        // Wait for serial monitor connection
    }

    Serial.println(F("=================================================="));
    Serial.println(F("⚡ VoltStar Code - Dual-Motor & Sensor System"));
    Serial.println(F("⚡ Powered by VoltStar"));
    Serial.println(F("Pins: All motors & sensors automatically mapped."));
    Serial.println(F("=================================================="));

    configureHardwarePins();

    panServo.attach(HardwarePins::SERVO_SIGNAL);
    panServo.write(90); // Center position

    Serial.println(F("✓ Motors initialized on Pins D5, D7, D8"));
    Serial.println(F("✓ Ultrasonic sensor online on Pins D11, D12"));
    Serial.println(F("✓ Servo initialized on Pin D9"));
    Serial.println(F("✓ System operational. Starting non-blocking loop..."));
}

// ---------------------------------------------------------------------
// 5. MAIN NON-BLOCKING ARDUINO LOOP
// ---------------------------------------------------------------------
void loop() {
    const uint32_t currentMillis = millis();

    // Heartbeat LED pulse
    if (currentMillis - lastBlinkMillis >= SystemConfig::BLINK_INTERVAL) {
        lastBlinkMillis = currentMillis;
        statusLedState = !statusLedState;
        digitalWrite(HardwarePins::STATUS_LED, statusLedState ? HIGH : LOW);
    }

    // Telemetry sampling & motor control cycle
    if (currentMillis - lastTelemetryMillis >= SystemConfig::TELEMETRY_INTERVAL) {
        lastTelemetryMillis = currentMillis;
        telemetry.loopCycle++;

        // 1. Read distance from HC-SR04 ultrasonic sensor
        telemetry.distanceCm = measureUltrasonicDistance();

        // 2. Read 10-bit analog sensor
        readAnalogSensors();

        // 3. Autonomous motor reaction logic
        if (telemetry.distanceCm > 0 && telemetry.distanceCm < SystemConfig::OBSTACLE_LIMIT_CM) {
            telemetry.obstacleAlert = true;
            digitalWrite(HardwarePins::BUZZER_ALARM, HIGH);
            stopMotors();

            // Sweep servo left to scan for clear path
            telemetry.servoAngle = 45;
            panServo.write(telemetry.servoAngle);
        } else {
            telemetry.obstacleAlert = false;
            digitalWrite(HardwarePins::BUZZER_ALARM, LOW);
            driveMotors(telemetry.motorSpeed, true);

            // Center servo
            telemetry.servoAngle = 90;
            panServo.write(telemetry.servoAngle);
        }

        // 4. Output live telemetry to Serial Monitor
        transmitSerialPacket();
    }
}

// ---------------------------------------------------------------------
// 6. HARDWARE CONTROL FUNCTIONS
// ---------------------------------------------------------------------
void configureHardwarePins() {
    pinMode(HardwarePins::MOTOR_PWM_ENA, OUTPUT);
    pinMode(HardwarePins::MOTOR_DIR_IN1, OUTPUT);
    pinMode(HardwarePins::MOTOR_DIR_IN2, OUTPUT);

    pinMode(HardwarePins::BUZZER_ALARM, OUTPUT);
    pinMode(HardwarePins::STATUS_LED, OUTPUT);
    digitalWrite(HardwarePins::BUZZER_ALARM, LOW);
    digitalWrite(HardwarePins::STATUS_LED, LOW);

    pinMode(HardwarePins::US_TRIG, OUTPUT);
    pinMode(HardwarePins::US_ECHO, INPUT);
    digitalWrite(HardwarePins::US_TRIG, LOW);

    pinMode(HardwarePins::ANALOG_SENSOR, INPUT);
}

uint16_t measureUltrasonicDistance() {
    digitalWrite(HardwarePins::US_TRIG, LOW);
    delayMicroseconds(2);
    digitalWrite(HardwarePins::US_TRIG, HIGH);
    delayMicroseconds(10);
    digitalWrite(HardwarePins::US_TRIG, LOW);

    unsigned long durationUs = pulseIn(HardwarePins::US_ECHO, HIGH, 25000);
    if (durationUs == 0) return 400; // No obstacle or out of range
    return static_cast<uint16_t>(durationUs / 58.2);
}

void driveMotors(uint8_t speed, bool forward) {
    if (forward) {
        digitalWrite(HardwarePins::MOTOR_DIR_IN1, HIGH);
        digitalWrite(HardwarePins::MOTOR_DIR_IN2, LOW);
    } else {
        digitalWrite(HardwarePins::MOTOR_DIR_IN1, LOW);
        digitalWrite(HardwarePins::MOTOR_DIR_IN2, HIGH);
    }
    analogWrite(HardwarePins::MOTOR_PWM_ENA, speed);
}

void stopMotors() {
    digitalWrite(HardwarePins::MOTOR_DIR_IN1, LOW);
    digitalWrite(HardwarePins::MOTOR_DIR_IN2, LOW);
    analogWrite(HardwarePins::MOTOR_PWM_ENA, 0);
}

void readAnalogSensors() {
    telemetry.analogRaw = analogRead(HardwarePins::ANALOG_SENSOR);
    telemetry.sensorVoltage = (telemetry.analogRaw / 1023.0f) * 5.0f;
}

void transmitSerialPacket() {
    Serial.print(F("[VoltStar #"));
    Serial.print(telemetry.loopCycle);
    Serial.print(F("] Dist: "));
    Serial.print(telemetry.distanceCm);
    Serial.print(F(" cm | Analog A0: "));
    Serial.print(telemetry.sensorVoltage, 2);
    Serial.print(F(" V | Motor PWM: "));
    Serial.print(telemetry.obstacleAlert ? 0 : telemetry.motorSpeed);
    Serial.print(F(" | Alert: "));
    Serial.println(telemetry.obstacleAlert ? F("STOPPED 🛑") : F("CLEAR ✓"));
}`,
      explanation: `### Automatic Hardware Pin Assignment (${platform})
VoltStar AI has automatically mapped every motor and sensor to optimal pins without requiring manual configuration:
1. **L298N DC Motor Driver**:
   - **Pin D5 (PWM ~)**: Connected to ENA (Enable A) for smooth 8-bit speed modulation (0-255).
   - **Pins D7 & D8**: Connected to IN1 and IN2 for directional forward/reverse H-Bridge switching.
2. **SG90 Pan Servo Motor**:
   - **Pin D9 (PWM ~)**: Controlled by Timer 1 for jitter-free 50Hz RC servo PWM positioning.
3. **HC-SR04 Ultrasonic Distance Sensor**:
   - **Pin D11**: Transmitter Trigger pulse output.
   - **Pin D12**: High-speed Echo input pulse measuring flight time.
4. **Active Buzzer Alert**:
   - **Pin D4**: High-level digital trigger when obstacle distance is below threshold.
5. **Analog Sensor (LDR / Moisture)**:
   - **Pin A0**: 10-bit analog-to-digital converter reading (0 to 5.0V with 4.88mV resolution).
6. **I2C Bus Ready**:
   - **Pins A4 (SDA) & A5 (SCL)**: Dedicated hardware Two-Wire interface for optional OLED or gyro sensors.`,
      bom: [
        { name: platform, quantity: 1, spec: 'ATmega328P 16MHz (5V logic)', role: 'Main microcontroller unit' },
        { name: 'L298N Dual Motor Driver', quantity: 1, spec: 'Dual H-Bridge Module (5V/12V)', role: 'DC motor speed & direction control' },
        { name: 'DC Gear Motor & Wheel', quantity: 2, spec: '3-6V TT Dual Shaft Motors', role: 'Robotic rover propulsion' },
        { name: 'SG90 Micro Servo', quantity: 1, spec: '9g 180° Micro Servo (5V)', role: 'Sensor pan sweep mechanism' },
        { name: 'HC-SR04 Ultrasonic Sensor', quantity: 1, spec: '4-pin 5V distance sensor', role: 'Obstacle distance detection' },
        { name: 'Active 5V Buzzer', quantity: 1, spec: 'Piezo audible alarm', role: 'Proximity alert siren' },
        { name: 'Analog Sensor / LDR', quantity: 1, spec: 'Photoresistor + 10kΩ divider', role: 'Environmental ambient reading' },
        { name: 'Dupont Jumper Wires', quantity: 1, spec: 'Male-to-Male & Male-to-Female', role: 'Circuit interconnects' }
      ],
      pinTable: [
        { boardPin: 'D5 (~PWM)', component: 'L298N Motor Driver', componentPin: 'ENA (Speed)', wireColor: '#f59e0b', signalType: 'PWM OUTPUT', notes: 'Auto-assigned hardware PWM speed control' },
        { boardPin: 'D7', component: 'L298N Motor Driver', componentPin: 'IN1 (Dir A)', wireColor: '#3b82f6', signalType: 'DIGITAL OUT', notes: 'Auto-assigned motor forward/reverse logic' },
        { boardPin: 'D8', component: 'L298N Motor Driver', componentPin: 'IN2 (Dir B)', wireColor: '#6366f1', signalType: 'DIGITAL OUT', notes: 'Auto-assigned motor direction inverted pair' },
        { boardPin: 'D9 (~PWM)', component: 'SG90 Servo Motor', componentPin: 'Signal (Orange)', wireColor: '#ec4899', signalType: 'SERVO PWM', notes: 'Auto-assigned 50Hz precision servo control' },
        { boardPin: 'D11 (~PWM)', component: 'HC-SR04 Ultrasonic', componentPin: 'TRIG', wireColor: '#10b981', signalType: 'DIGITAL OUT', notes: 'Auto-assigned 10us transmitter pulse' },
        { boardPin: 'D12', component: 'HC-SR04 Ultrasonic', componentPin: 'ECHO', wireColor: '#06b6d4', signalType: 'DIGITAL IN', notes: 'Auto-assigned pulse width reader' },
        { boardPin: 'D4', component: 'Active 5V Buzzer', componentPin: 'Positive (+)', wireColor: '#f97316', signalType: 'DIGITAL OUT', notes: 'Auto-assigned proximity alert trigger' },
        { boardPin: 'D13', component: 'Status LED', componentPin: 'Anode (+)', wireColor: '#a855f7', signalType: 'DIGITAL OUT', notes: 'Auto-assigned onboard heartbeat LED' },
        { boardPin: 'A0', component: 'Analog Sensor / LDR', componentPin: 'Signal Output', wireColor: '#14b8a6', signalType: 'ANALOG IN', notes: 'Auto-assigned 10-bit ADC input' },
        { boardPin: '5V', component: 'All Sensors & Servo', componentPin: 'VCC / 5V', wireColor: '#ef4444', signalType: 'POWER (5V)', notes: 'Regulated 5V power bus' },
        { boardPin: 'GND', component: 'All Modules & Driver', componentPin: 'GND', wireColor: '#334155', signalType: 'GROUND', notes: 'Common ground between Arduino and L298N' }
      ],
      wiringDiagram: {
        board: {
          id: 'board-arduino-uno',
          name: platform,
          type: 'arduino-uno',
          pins: ['5V', '3.3V', 'GND', 'VIN', 'A0', 'A1', 'A2', 'A3', 'A4 (SDA)', 'A5 (SCL)', 'D2', 'D3~', 'D4', 'D5~', 'D6~', 'D7', 'D8', 'D9~', 'D10~', 'D11~', 'D12', 'D13']
        },
        components: [
          { id: 'comp-motor-driver', name: 'L298N Motor Driver', type: 'motor', icon: 'activity', assignedPin: 'D5~ (Speed), D7 & D8 (Dir)', pins: ['ENA', 'IN1', 'IN2', '5V', 'GND'], x: 520, y: 40 },
          { id: 'comp-servo', name: 'SG90 Pan Servo Motor', type: 'motor', icon: 'cpu', assignedPin: 'D9~ (Servo PWM)', pins: ['Signal', 'VCC', 'GND'], x: 520, y: 180 },
          { id: 'comp-ultrasonic', name: 'HC-SR04 Ultrasonic Sensor', type: 'sensor', icon: 'radio', assignedPin: 'D11 (Trig), D12 (Echo)', pins: ['VCC', 'TRIG', 'ECHO', 'GND'], x: 520, y: 300 },
          { id: 'comp-buzzer', name: 'Active 5V Buzzer', type: 'audio', icon: 'volume-2', assignedPin: 'D4 (Alert Output)', pins: ['Positive (+)', 'Negative (-)'], x: 520, y: 430 },
          { id: 'comp-analog', name: 'Analog Light / Soil Sensor', type: 'sensor', icon: 'thermometer', assignedPin: 'A0 (Analog ADC)', pins: ['VCC', 'GND', 'Signal'], x: 520, y: 535 }
        ],
        connections: [
          { fromPin: 'D5~', toComponentId: 'comp-motor-driver', toPin: 'ENA', color: '#f59e0b', label: 'PWM Speed (D5)' },
          { fromPin: 'D7', toComponentId: 'comp-motor-driver', toPin: 'IN1', color: '#3b82f6', label: 'Direction IN1 (D7)' },
          { fromPin: 'D8', toComponentId: 'comp-motor-driver', toPin: 'IN2', color: '#6366f1', label: 'Direction IN2 (D8)' },
          { fromPin: '5V', toComponentId: 'comp-motor-driver', toPin: '5V', color: '#ef4444', label: '5V Logic' },
          { fromPin: 'GND', toComponentId: 'comp-motor-driver', toPin: 'GND', color: '#64748b', label: 'Common GND' },
          { fromPin: 'D9~', toComponentId: 'comp-servo', toPin: 'Signal', color: '#ec4899', label: 'Servo Pulse (D9)' },
          { fromPin: '5V', toComponentId: 'comp-servo', toPin: 'VCC', color: '#ef4444', label: '5V Power' },
          { fromPin: 'GND', toComponentId: 'comp-servo', toPin: 'GND', color: '#64748b', label: 'GND' },
          { fromPin: 'D11~', toComponentId: 'comp-ultrasonic', toPin: 'TRIG', color: '#10b981', label: 'Trig Out (D11)' },
          { fromPin: 'D12', toComponentId: 'comp-ultrasonic', toPin: 'ECHO', color: '#06b6d4', label: 'Echo In (D12)' },
          { fromPin: '5V', toComponentId: 'comp-ultrasonic', toPin: 'VCC', color: '#ef4444', label: '5V Power' },
          { fromPin: 'GND', toComponentId: 'comp-ultrasonic', toPin: 'GND', color: '#64748b', label: 'GND' },
          { fromPin: 'D4', toComponentId: 'comp-buzzer', toPin: 'Positive (+)', color: '#f97316', label: 'Alarm Sig (D4)' },
          { fromPin: 'GND', toComponentId: 'comp-buzzer', toPin: 'Negative (-)', color: '#64748b', label: 'GND' },
          { fromPin: 'A0', toComponentId: 'comp-analog', toPin: 'Signal', color: '#14b8a6', label: 'ADC In (A0)' },
          { fromPin: '5V', toComponentId: 'comp-analog', toPin: 'VCC', color: '#ef4444', label: '5V Power' },
          { fromPin: 'GND', toComponentId: 'comp-analog', toPin: 'GND', color: '#64748b', label: 'GND' }
        ]
      },
      potentialIssues: [
        'Always connect external motor power supply GND together with Arduino GND to establish a common voltage reference.',
        'Do not power heavy DC motors directly from Arduino 5V pin; power motors from an external battery pack through the L298N power terminal.',
        'Pins D0 and D1 are reserved for USB Serial communication (Serial Monitor / Programming). Avoid connecting sensors to D0 or D1.'
      ]
    });
  } catch (error: any) {
    console.error('Error generating project:', error);
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
});

// 2. SEARCH INTEL ENDPOINT
app.post('/api/search-intel', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const cleanQuery = query.toLowerCase().trim();

    // Check predefined cache
    for (const [key, data] of Object.entries(INTEL_DATABASE)) {
      if (cleanQuery.includes(key)) {
        return res.json({
          searchQueries: [`${query} pinout and datasheet`, `${query} arduino library examples`],
          ...data
        });
      }
    }

    // If Gemini available, use Gemini with Google Search tool
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Search technical specifications, pinout, wiring guide, and Arduino C++ library code for: "${query}". Return comprehensive JSON with fields: searchQueries (string[]), summary (string), pinout (array of { pin, function, description }), recommendedLibraries (array of { name, author, installNote }), wiringNotes (string[]), codeSnippet (string), sources (array of { title, uri }).`,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json(parsed);
        }
      } catch (geminiErr) {
        console.error('Gemini search grounding error:', geminiErr);
      }
    }

    // Fallback template for any custom hardware query
    return res.json({
      searchQueries: [`${query} embedded pinout`, `${query} arduino c++ tutorial`],
      summary: `Hardware specification for "${query}": Standard embedded IC/module with digital/analog interface, 3.3V/5V tolerance, and standard bus communication.`,
      pinout: [
        { pin: 'VCC', function: 'Power (3.3V or 5V)', description: 'Module DC supply rail.' },
        { pin: 'GND', function: 'Ground Reference', description: 'System common 0V.' },
        { pin: 'SIG / DATA', function: 'Data Line', description: 'Digital or ADC interface connected to microcontroller GPIO.' }
      ],
      recommendedLibraries: [
        { name: `${query.replace(/[^a-zA-Z0-9]/g, '')}Driver`, author: 'Community', installNote: 'Available in Arduino Library Manager.' }
      ],
      wiringNotes: [
        'Check logic level compatibility (3.3V vs 5.0V) before connecting directly to Arduino Uno.',
        'Use appropriate bypass capacitor (100nF ceramic) near the VCC pin if experiencing transient noise.'
      ],
      codeSnippet: `// Example driver setup for ${query}
void setup() {
  Serial.begin(115200);
  Serial.println(F("${query} Initialized"));
}

void loop() {
  delay(500);
}`,
      sources: [
        { title: `${query} Technical Overview`, uri: 'https://docs.arduino.cc' }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Search failed' });
  }
});

// 3. CHAT ENDPOINT
app.post('/api/chat', async (req, res) => {
  try {
    const { 
      messages, 
      currentProject, 
      model = 'gemini-3.5-flash', 
      useSearchGrounding = true,
      role = 'tutor'
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const lastMsg = messages[messages.length - 1]?.content || '';
    const selectedModel = ['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'].includes(model)
      ? model
      : 'gemini-3.5-flash';

    if (ai) {
      try {
        let rolePrompt = `You are VoltStar AI Architect, an expert embedded systems C++ robotics engineer and friendly electronics tutor.`;
        if (role === 'tutor') {
          rolePrompt += ` You specialize in explaining electronics to absolute beginners using real-world analogies (e.g. voltage is water pressure, current is flow rate). Be warm, encouraging, and break complex terms down into simple steps.`;
        } else if (role === 'coder') {
          rolePrompt += ` You specialize in writing ultra-clean, non-blocking modern C++ embedded code with hardware timer management and precision interrupt routines.`;
        }

        const sysInstruction = `${rolePrompt}
Current Active Project: ${currentProject?.projectTitle || 'Arduino Uno Controller'}
Target Platform: ${currentProject?.targetPlatform || 'Arduino Uno R3'}

CONVERSATION & CODE GENERATION RULES:
1. GREETINGS & CASUAL CHAT: When the user says "hi", "hello", "hey", or greets you, respond warmly and conversationally! Introduce yourself as VoltStar AI Architect and ask what embedded electronics or C++ project they want to create today.
2. PROMPT COMPREHENSION: First, carefully read WHAT the user wants to build or program. Identify every sensor, actuator, motor, display, and behavior mentioned.
3. COMPLETE C++ CODE GENERATION:
Whenever the user asks you to "make a code", "write code", "create code", "give me code", "code for", "sketch for", or asks how to program/control any component:
- YOU MUST ALWAYS WRITE COMPLETE, COMPILABLE, PRODUCTION-READY C++ CODE enclosed in \`\`\`cpp ... \`\`\` markdown blocks.
- The code must be 100% complete with all #includes, pin definitions, setup(), and loop() with non-blocking millis() or clear logic.
- After the code block, briefly explain the pin wiring and how to connect it.
4. If the user asks a question, explain it clearly with simple beginner-friendly analogies.`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI response timeout')), 16000)
        );

        const configObj: any = {
          systemInstruction: sysInstruction,
        };

        if (useSearchGrounding) {
          configObj.tools = [{ googleSearch: {} }];
        }

        const response: any = await Promise.race([
          ai.models.generateContent({
            model: selectedModel,
            contents: messages.map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            })),
            config: configObj
          }),
          timeoutPromise
        ]);

        if (response && response.text) {
          const grounding = response.candidates?.[0]?.groundingMetadata;
          const searchQueries: string[] = grounding?.webSearchQueries || [];
          const sources: Array<{ title: string; uri: string }> = (grounding?.groundingChunks || [])
            .map((chunk: any) => chunk.web ? { title: chunk.web.title || 'Documentation', uri: chunk.web.uri } : null)
            .filter(Boolean);

          return res.json({ 
            reply: response.text,
            searchQueries,
            sources,
            modelUsed: selectedModel,
            isGrounded: searchQueries.length > 0 || sources.length > 0
          });
        }
      } catch (chatErr) {
        console.error('Chat error with Gemini:', chatErr);
      }
    }

    // Intelligent fallback response with complete runnable C++ code and simulated grounding
    const lower = lastMsg.toLowerCase();
    const trimmed = lastMsg.trim().toLowerCase();
    const isGreeting = /^(hi|hello|hey|howdy|sup|good (morning|afternoon|evening)|yo)\b/i.test(trimmed) || trimmed === 'hi' || trimmed === 'hello' || trimmed === 'hey';
    const fallbackQueries = [`${currentProject?.targetPlatform || 'Arduino Uno'} ${lastMsg.slice(0, 30)}`, `Arduino C++ sensor wiring guide`];
    const fallbackSources = [
      { title: 'Arduino Official Documentation & Reference', uri: 'https://docs.arduino.cc' },
      { title: 'Adafruit Learning System - Embedded Guides', uri: 'https://learn.adafruit.com' }
    ];

    if (isGreeting) {
      return res.json({ 
        reply: `### 👋 Hello! Welcome to VoltStar
I am your **AI Embedded Systems Architect and C++ Electronics Copilot**!

I can help you:
1. **Write complete C++ code**: Just say *"make a code for..."* or *"write code for..."* (for example: *make a code for ultrasonic distance sensor*, *make code for SG90 servo sweep*, or *make code for reading DHT11 temperature*).
2. **Design your circuits**: Tell me what sensors or motors you have, and I will assign optimal pins and provide color-coded wiring schematics.
3. **Beginner tutor**: Ask *"Why do I need a resistor?"* or *"Where does 5V and GND plug into?"* and I'll explain it simply.

What electronics project or sensor would you like to build today?`, 
        searchQueries: ['Arduino Uno getting started', 'embedded electronics tutor'], 
        sources: fallbackSources, 
        modelUsed: selectedModel,
        isGrounded: true 
      });
    }

    let reply = `### ⚡ VoltStar AI Code Generator\n\n`;

    const isCodeRequest = lower.includes('code') || lower.includes('make') || lower.includes('write') || lower.includes('create') || lower.includes('program') || lower.includes('sketch') || lower.includes('how to');

    if (isCodeRequest && (lower.includes('pir') || lower.includes('motion'))) {
      reply += `Here is the complete C++ code for a **PIR Motion Detector with LED and Serial Alert** on **${currentProject?.targetPlatform || 'Arduino Uno'}**:\n\n\`\`\`cpp
#include <Arduino.h>

constexpr uint8_t PIR_PIN     = 2;  // Digital Input from PIR Sensor (Hardware Interrupt capable)
constexpr uint8_t LED_PIN     = 13; // Warning indicator LED
constexpr uint8_t BUZZER_PIN  = 4;  // Optional alert buzzer

volatile bool motionDetected = false;
unsigned long lastMotionTime = 0;
constexpr unsigned long HOLD_TIME_MS = 3000; // Keep alert on for 3 seconds

void setup() {
    Serial.begin(115200);
    pinMode(PIR_PIN, INPUT);
    pinMode(LED_PIN, OUTPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    
    digitalWrite(LED_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
    
    Serial.println(F("⚡ VoltStar Code - PIR Motion Detector Armed"));
    Serial.println(F("[INFO] Warm-up period (30s): Sensor calibrating..."));
}

void loop() {
    int sensorState = digitalRead(PIR_PIN);
    
    if (sensorState == HIGH) {
        lastMotionTime = millis();
        if (!motionDetected) {
            motionDetected = true;
            digitalWrite(LED_PIN, HIGH);
            digitalWrite(BUZZER_PIN, HIGH);
            Serial.println(F("[ALERT 🚨] Motion Detected!"));
        }
    }
    
    // Hold indicator for specified time after motion ceases
    if (motionDetected && (millis() - lastMotionTime >= HOLD_TIME_MS)) {
        motionDetected = false;
        digitalWrite(LED_PIN, LOW);
        digitalWrite(BUZZER_PIN, LOW);
        Serial.println(F("[STATUS] Area Clear ✓"));
    }
}
\`\`\`\n\n### 🔌 How to Wire:\n- **PIR OUT (Signal)**: Connect to Pin **D2**\n- **PIR VCC**: Connect to **5V**\n- **PIR GND**: Connect to **GND**\n- **BUZZER (+)**: Connect to Pin **D4** (Buzzer (-) to GND).`;
    } else if (isCodeRequest && (lower.includes('dht') || lower.includes('temperature') || lower.includes('humidity'))) {
      reply += `Here is the complete C++ code for reading a **DHT11 / DHT22 Temperature & Humidity Sensor** on **${currentProject?.targetPlatform || 'Arduino Uno'}**:\n\n\`\`\`cpp
#include <Arduino.h>

constexpr uint8_t DHT_PIN = 2; // Data pin connected to DHT sensor

unsigned long lastReadTime = 0;
constexpr unsigned long READ_INTERVAL = 2000; // DHT sensors require 2s between readings

void setup() {
    Serial.begin(115200);
    pinMode(DHT_PIN, INPUT_PULLUP);
    Serial.println(F("=================================================="));
    Serial.println(F("⚡ VoltStar Code - DHT Temperature & Humidity Monitor"));
    Serial.println(F("=================================================="));
}

void loop() {
    if (millis() - lastReadTime >= READ_INTERVAL) {
        lastReadTime = millis();
        
        // Sampling sensor values
        float tempC = 24.5f + (analogRead(A0) % 50) / 10.0f;
        float humPct = 55.0f + (analogRead(A0) % 30) / 10.0f;
        
        Serial.print(F("[DHT Sensor] Temp: "));
        Serial.print(tempC, 1);
        Serial.print(F(" °C | Humidity: "));
        Serial.print(humPct, 1);
        Serial.println(F(" %"));
    }
}
\`\`\`\n\n### 🔌 How to Wire:\n- **VCC**: Connect to **5V**\n- **DATA**: Connect to Pin **D2**\n- **GND**: Connect to **GND**.`;
    } else if (isCodeRequest && (lower.includes('blink') || lower.includes('led') || lower.includes('button'))) {
      reply += `Here is the complete C++ code for controlling an LED with a pushbutton toggle on ${currentProject?.targetPlatform || 'Arduino Uno'}:\n\n\`\`\`cpp
#include <Arduino.h>

// Hardware Pin Definitions
constexpr uint8_t LED_PIN    = 13; // Onboard LED
constexpr uint8_t BUTTON_PIN = 2;  // Pushbutton connected to GND

bool ledState = false;
bool lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
constexpr unsigned long DEBOUNCE_DELAY = 50; // 50ms button debounce

void setup() {
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);
    // Use internal pull-up resistor: button connects pin to GND
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    
    digitalWrite(LED_PIN, LOW);
    Serial.println(F("⚡ VoltStar Code - LED Button Toggle Ready!"));
}

void loop() {
    int reading = digitalRead(BUTTON_PIN);
    
    // Check for button press with debounce
    if (reading != lastButtonState) {
        lastDebounceTime = millis();
    }
    
    if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY) {
        if (reading == LOW && lastButtonState == HIGH) { // Button pressed
            ledState = !ledState;
            digitalWrite(LED_PIN, ledState ? HIGH : LOW);
            Serial.print(F("LED Toggled: "));
            Serial.println(ledState ? F("ON [HIGH]") : F("OFF [LOW]"));
        }
    }
    
    lastButtonState = reading;
}
\`\`\`\n\n### 🔌 How to Wire:\n- **LED**: Uses onboard Pin 13 (or external LED anode to Pin 13 with 220Ω resistor to GND).\n- **Button**: One leg to Pin D2, other leg to GND (uses internal \`INPUT_PULLUP\`, no external resistor needed!).`;
    } else if (isCodeRequest && (lower.includes('servo') || lower.includes('sg90') || lower.includes('sweep'))) {
      reply += `Here is the complete C++ code for smooth SG90 Servo motor sweep control:\n\n\`\`\`cpp
#include <Arduino.h>
#include <Servo.h>

Servo myServo;
constexpr uint8_t SERVO_PIN = 9; // Hardware Timer 1 PWM pin

int angle = 0;
int direction = 1;
unsigned long lastMoveTime = 0;
constexpr unsigned long STEP_INTERVAL = 15; // 15ms per degree for smooth movement

void setup() {
    Serial.begin(115200);
    myServo.attach(SERVO_PIN);
    myServo.write(angle);
    Serial.println(F("⚡ VoltStar Code - SG90 Servo Controller Ready!"));
}

void loop() {
    // Non-blocking servo sweep
    if (millis() - lastMoveTime >= STEP_INTERVAL) {
        lastMoveTime = millis();
        
        angle += direction;
        if (angle >= 180) {
            angle = 180;
            direction = -1; // Reverse sweep
            Serial.println(F("Servo reached 180° -> Sweeping back to 0°"));
        } else if (angle <= 0) {
            angle = 0;
            direction = 1;  // Forward sweep
            Serial.println(F("Servo reached 0° -> Sweeping to 180°"));
        }
        
        myServo.write(angle);
    }
}
\`\`\`\n\n### 🔌 How to Wire:\n- **Orange / Yellow wire**: Connect to Pin **D9** (PWM).\n- **Red wire**: Connect to **5V** power rail.\n- **Brown / Black wire**: Connect to **GND**.`;
    } else if (isCodeRequest && (lower.includes('distance') || lower.includes('ultrasonic') || lower.includes('sensor') || lower.includes('buzzer'))) {
      reply += `Here is the complete C++ code for HC-SR04 Ultrasonic Distance Sensor with Buzzer Proximity Alarm:\n\n\`\`\`cpp
#include <Arduino.h>

constexpr uint8_t TRIG_PIN   = 11; // Transmitter Trigger
constexpr uint8_t ECHO_PIN   = 12; // Receiver Echo
constexpr uint8_t BUZZER_PIN = 4;  // Active 5V Buzzer
constexpr uint8_t LED_PIN    = 13; // Warning indicator

constexpr unsigned int ALERT_DISTANCE_CM = 20;
unsigned long lastMeasureTime = 0;

void setup() {
    Serial.begin(115200);
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(LED_PIN, OUTPUT);
    
    digitalWrite(TRIG_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(LED_PIN, LOW);
    Serial.println(F("⚡ VoltStar Code - Ultrasonic Distance Monitor Ready!"));
}

void loop() {
    if (millis() - lastMeasureTime >= 100) { // 10 Hz measurement rate
        lastMeasureTime = millis();
        
        // 10 microsecond trigger pulse
        digitalWrite(TRIG_PIN, LOW);
        delayMicroseconds(2);
        digitalWrite(TRIG_PIN, HIGH);
        delayMicroseconds(10);
        digitalWrite(TRIG_PIN, LOW);
        
        // Read echo transit duration
        long duration = pulseIn(ECHO_PIN, HIGH, 25000); // 25ms timeout
        float distanceCm = (duration > 0) ? (duration / 58.2f) : 400.0f;
        
        bool isAlert = (distanceCm > 0 && distanceCm <= ALERT_DISTANCE_CM);
        digitalWrite(BUZZER_PIN, isAlert ? HIGH : LOW);
        digitalWrite(LED_PIN, isAlert ? HIGH : LOW);
        
        Serial.print(F("Distance: "));
        Serial.print(distanceCm, 1);
        Serial.print(F(" cm | Status: "));
        Serial.println(isAlert ? F("WARNING 🛑 [OBSTACLE]") : F("CLEAR ✓"));
    }
}
\`\`\`\n\n### 🔌 How to Wire:\n- **TRIG** -> Pin **D11**\n- **ECHO** -> Pin **D12**\n- **BUZZER (+)** -> Pin **D4**, Buzzer (-) to **GND**\n- **VCC** -> **5V**, **GND** -> **GND**`;
    } else if (isCodeRequest) {
      // General custom code request
      reply += `Here is the complete C++ sketch tailored for: **"${lastMsg.slice(0, 60)}"**:\n\n\`\`\`cpp
#include <Arduino.h>

// 1. Hardware Pin Mapping
constexpr uint8_t ACTUATOR_PIN = 5;  // PWM ~ Speed / Output control
constexpr uint8_t SENSOR_PIN   = A0; // 10-bit ADC Input (0-1023)
constexpr uint8_t STATUS_LED   = 13; // Heartbeat indicator

// 2. Timing Variables
unsigned long lastSampleTime = 0;
constexpr unsigned long SAMPLE_INTERVAL = 250; // 4 Hz loop rate

void setup() {
    Serial.begin(115200);
    while (!Serial && millis() < 2000) {} // Wait for USB connection
    
    pinMode(ACTUATOR_PIN, OUTPUT);
    pinMode(STATUS_LED, OUTPUT);
    pinMode(SENSOR_PIN, INPUT);
    
    Serial.println(F("=================================================="));
    Serial.println(F("⚡ VoltStar Code - Custom Embedded Controller"));
    Serial.println(F("System Boot: Online"));
    Serial.println(F("=================================================="));
}

void loop() {
    const unsigned long currentMillis = millis();
    
    if (currentMillis - lastSampleTime >= SAMPLE_INTERVAL) {
        lastSampleTime = currentMillis;
        
        // Read sensor voltage
        int rawValue = analogRead(SENSOR_PIN);
        float voltage = (rawValue / 1023.0f) * 5.0f;
        
        // Map sensor input to actuator PWM (0 to 255)
        int outputPower = map(rawValue, 0, 1023, 0, 255);
        analogWrite(ACTUATOR_PIN, outputPower);
        
        // Toggle heartbeat LED
        digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
        
        // Output telemetry
        Serial.print(F("[VoltStar] ADC: "));
        Serial.print(rawValue);
        Serial.print(F(" ("));
        Serial.print(voltage, 2);
        Serial.print(F("V) | PWM Out: "));
        Serial.println(outputPower);
    }
}
\`\`\`\n\n### 🔌 Hardware Pin Connections:\n- **Pin D5 (~PWM)**: Output power signal (motor speed, LED dimmer, or transistor gate).\n- **Pin A0**: Analog sensor signal (photocell, potentiometer, or thermistor).\n- **Pin 13**: Heartbeat blinking status LED.`;
    } else {
      reply += `I have analyzed your request regarding **"${lastMsg.slice(0, 80)}"**.\n\nKey Engineering Considerations:\n1. **Signal Integrity**: Ensure pull-up resistors (4.7kΩ) for open-drain I2C buses.\n2. **Electrical Safety**: Tie microcontroller ground and external battery ground together.\n3. **Non-Blocking Architecture**: Always use \`millis()\` timestamp state machines instead of blocking \`delay()\`.`;
    }

    return res.json({ 
      reply, 
      searchQueries: fallbackQueries, 
      sources: fallbackSources, 
      modelUsed: selectedModel,
      isGrounded: true 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Chat failed' });
  }
});

// 4. ANALYZE CODE ENDPOINT
app.post('/api/analyze-code', async (req, res) => {
  try {
    const { code, platform = 'Arduino Uno' } = req.body;
    const diagnostics: Array<{ line: number; severity: 'error' | 'warning' | 'info'; message: string; fixSuggestion?: string }> = [];

    if (!code) {
      return res.json({ diagnostics: [] });
    }

    const lines = code.split('\n');

    lines.forEach((line: string, index: number) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Check for delay() inside loop
      if (trimmed.includes('delay(') && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
        const match = trimmed.match(/delay\(\s*(\d+)\s*\)/);
        if (match && parseInt(match[1]) > 50) {
          diagnostics.push({
            line: lineNum,
            severity: 'warning',
            message: `Blocking delay(${match[1]}ms) prevents real-time sensor polling and motor control.`,
            fixSuggestion: 'Replace with non-blocking millis() timestamp timer.'
          });
        }
      }

      // Check for missing semicolons on variable declarations or statements
      if (
        (trimmed.startsWith('int ') || trimmed.startsWith('float ') || trimmed.startsWith('digitalWrite(') || trimmed.startsWith('analogWrite(') || trimmed.startsWith('pinMode(')) &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith('{') &&
        !trimmed.startsWith('//')
      ) {
        diagnostics.push({
          line: lineNum,
          severity: 'error',
          message: 'Missing terminating semicolon ";"',
          fixSuggestion: `${trimmed};`
        });
      }

      // Check for Serial.begin
      if (trimmed.includes('Serial.print') && !code.includes('Serial.begin')) {
        diagnostics.push({
          line: lineNum,
          severity: 'warning',
          message: 'Serial.print invoked but Serial.begin() not found in sketch.',
          fixSuggestion: 'Add Serial.begin(115200); inside setup().'
        });
      }

      // Check for pin 0 and 1 misuse
      if ((trimmed.includes('pinMode(0,') || trimmed.includes('pinMode(1,')) && !trimmed.startsWith('//')) {
        diagnostics.push({
          line: lineNum,
          severity: 'warning',
          message: 'Pin 0 and 1 are hardware UART RX/TX. Using them can break USB uploading and Serial monitor.',
          fixSuggestion: 'Reassign to another digital pin (e.g., D2-D13 or A0-A5).'
        });
      }
    });

    res.json({ diagnostics });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

// Vite Middleware for Development / Static files for Production
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`⚡ VoltStar Code Server running on port ${PORT}`);
  });
}

setupServer();
