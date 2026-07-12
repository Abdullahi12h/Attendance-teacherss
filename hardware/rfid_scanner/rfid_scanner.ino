/**
 * Smart Biometric RFID Attendance System - Arduino Sketch
 * 
 * Hardware Connection Guide:
 * 
 * 1. MFRC522 RFID Reader:
 *    - SDA (SS)  -> Pin 10
 *    - SCK       -> Pin 13
 *    - MOSI      -> Pin 11
 *    - MISO      -> Pin 12
 *    - IRQ       -> Not Connected
 *    - GND       -> GND
 *    - RST       -> Pin 9
 *    - 3.3V      -> 3.3V (Do NOT connect to 5V!)
 * 
 * 2. 16x2 I2C LCD Display:
 *    - GND       -> GND
 *    - VCC       -> 5V
 *    - SDA       -> Pin A4 (or dedicated SDA pin)
 *    - SCL       -> Pin A5 (or dedicated SCL pin)
 * 
 * 3. Indicators:
 *    - Green LED -> Pin 2 (Success indicator)
 *    - Red LED   -> Pin 3 (Error/Unregistered indicator)
 *    - Yellow LED-> Pin 4 (Duplicate scan indicator)
 *    - Buzzer    -> Pin 5 (Acoustic feedback)
 */

#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// RFID Pin Configuration
#define RST_PIN         9
#define SS_PIN          10

// Pin Configurations
#define GREEN_LED_PIN   2
#define RED_LED_PIN     3
#define YELLOW_LED_PIN  4
#define BUZZER_PIN      5

// Initialize RFID and LCD Instances
MFRC522 mfrc522(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27, 16, 2); // I2C address 0x27, 16 columns, 2 rows

void setup() {
  // Initialize Serial communication (9600 Baud)
  Serial.begin(9600);
  while (!Serial); // Wait for serial connection to establish

  // Initialize SPI bus
  SPI.begin();

  // Initialize RFID Reader
  mfrc522.PCD_Init();

  // Initialize LCD Display
  lcd.init();
  lcd.backlight();

  // Pin Modes
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(YELLOW_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // Turn off all indicators
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(YELLOW_LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  // Ready message
  showDefaultMessage();
}

void loop() {
  // Look for new RFID cards
  if ( ! mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  // Select one of the cards
  if ( ! mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // Read card UID and convert to Hex string
  String uidStr = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) {
      uidStr += "0";
    }
    uidStr += String(mfrc522.uid.uidByte[i], HEX);
  }
  uidStr.toUpperCase();

  // Halt PICC
  mfrc522.PICC_HaltA();

  // Update LCD to show communication state
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Scanning Card...");
  lcd.setCursor(0, 1);
  lcd.print("UID: " + uidStr);

  // Send UID over serial to Express server
  Serial.println("UID:" + uidStr);

  // Wait for the backend response over Serial (blocking read with 3s timeout)
  unsigned long startTimeout = millis();
  String response = "";
  bool gotResponse = false;

  while (millis() - startTimeout < 3000) {
    if (Serial.available() > 0) {
      response = Serial.readStringUntil('\n');
      response.trim();
      gotResponse = true;
      break;
    }
  }

  if (gotResponse) {
    processResponse(response);
  } else {
    // Timeout error
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Server Timeout!");
    lcd.setCursor(0, 1);
    lcd.print("Try Again.");
    
    // Play error sound/LED
    triggerIndicator(RED_LED_PIN, 1000, 1);
    showDefaultMessage();
  }
}

// Display standby message
void showDefaultMessage() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Smart Attendance");
  lcd.setCursor(0, 1);
  lcd.print("Scan RFID Card...");
}

// Process feedback sent from Node/Express server
void processResponse(String response) {
  lcd.clear();

  if (response.startsWith("OK:")) {
    // Success: Format "OK:Student Name:Check-in Time"
    int firstSeparator = response.indexOf(':', 3);
    String studentName = response.substring(3, firstSeparator);
    String checkinTime = response.substring(firstSeparator + 1);

    lcd.setCursor(0, 0);
    lcd.print("Success!");
    lcd.setCursor(0, 1);
    lcd.print(studentName.substring(0, 16)); // Limit to 16 chars

    // Visual & Audio Feedback: Green LED ON, Short Beep
    digitalWrite(GREEN_LED_PIN, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(BUZZER_PIN, LOW);
    delay(800);
    digitalWrite(GREEN_LED_PIN, LOW);

  } else if (response.startsWith("DUP:")) {
    // Duplicate: Format "DUP:Message"
    String msg = response.substring(4);

    lcd.setCursor(0, 0);
    lcd.print("Already Scanned");
    lcd.setCursor(0, 1);
    lcd.print(msg.substring(0, 16));

    // Visual & Audio Feedback: Yellow LED ON, Double Beep
    digitalWrite(YELLOW_LED_PIN, HIGH);
    for (int i = 0; i < 2; i++) {
      digitalWrite(BUZZER_PIN, HIGH);
      delay(100);
      digitalWrite(BUZZER_PIN, LOW);
      delay(80);
    }
    delay(640);
    digitalWrite(YELLOW_LED_PIN, LOW);

  } else if (response.startsWith("ERR:")) {
    // Error: Format "ERR:Reason"
    String reason = response.substring(4);

    lcd.setCursor(0, 0);
    lcd.print("Access Denied");
    lcd.setCursor(0, 1);
    lcd.print(reason.substring(0, 16));

    // Visual & Audio Feedback: Red LED ON, Long Beep
    digitalWrite(RED_LED_PIN, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(1000);
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(RED_LED_PIN, LOW);

  } else {
    // Unknown server payload
    lcd.setCursor(0, 0);
    lcd.print("Comm Error");
    lcd.setCursor(0, 1);
    lcd.print(response.substring(0, 16));
    
    digitalWrite(RED_LED_PIN, HIGH);
    delay(1000);
    digitalWrite(RED_LED_PIN, LOW);
  }

  // Restore standby screen
  showDefaultMessage();
}

// Helper to flash an LED and beep the buzzer
void triggerIndicator(int ledPin, int duration, int count) {
  for (int i = 0; i < count; i++) {
    digitalWrite(ledPin, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(duration / (count * 2));
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(ledPin, LOW);
    delay(duration / (count * 2));
  }
}
