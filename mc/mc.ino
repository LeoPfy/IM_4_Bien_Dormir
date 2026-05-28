#include "DHT.h"
#include <driver/i2s.h>
#include <math.h>

#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>

const char *ssid = "tinkergarden";  // your WLAN ssid
const char *pass = "strenggeheim";  // your WLAN PW
const char* serverURL = "https://biendormir.orusovez.myhostpoint.ch/api/save_sensor_data.php";  // Server-Adresse: hier kann http oder https stehen, aber nicht ohne, zB. https://im4.physco.dorfkneipe.ch/api/load.php

bool isWlanConnected = 0;
int led = LED_BUILTIN;

int btnGPIO = 0;
int btnState = false;

// ---------- DHT11 ----------
#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// ---------- INMP441 Mikrofon ----------
#define I2S_WS 4
#define I2S_SCK 5
#define I2S_SD 6
#define I2S_PORT I2S_NUM_0
#define BUFFER_LEN 64

int16_t sBuffer[BUFFER_LEN];

// ---------- Grenzwerte ----------
float tempMin = 16.0;
float tempMax = 20.0;
float humidityMin = 40.0;
float humidityMax = 60.0;
float noiseLimitDb = 30.0;

void setup() {
  Serial.begin(115200);
  delay(2000);

  Serial.println("Bien Dormir Sensor startet...");

  dht.begin();

  // Mikrofon Setup
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 44100,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = 0,
    .dma_buf_count = 8,
    .dma_buf_len = BUFFER_LEN,
    .use_apll = false
  };

  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_SD
  };

  i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_PORT, &pin_config);

  Serial.begin(115200);
  delay(10);

  // Set GPIO0 Boot button as input
  pinMode(btnGPIO, INPUT);

  // We start by connecting to a WiFi network
  // To debug, please enable Core Debug Level to Verbose

  Serial.println();
  Serial.print("[WiFi] Connecting to ");
  Serial.println(ssid);

  connectWiFi();
}

void loop() {
  if (!is_wlan_connected()) return; 

  // ---------- Temperatur & Luftfeuchtigkeit ----------
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();

  // ---------- Mikrofon auslesen ----------
  size_t bytesIn = 0;
  i2s_read(I2S_PORT, &sBuffer, BUFFER_LEN, &bytesIn, portMAX_DELAY);

  int micValue = 0;

  for (int i = 0; i < BUFFER_LEN; i++) {
    int value = abs(sBuffer[i]);
    if (value > micValue) {
      micValue = value;
    }
  }

  // ---------- dB-Schätzung ----------
  float dB = 0;

  if (micValue > 0) {
    dB = 20.0 * log10((float)micValue);
  }

  // ---------- Ausgabe ----------
  Serial.println("----- Bien Dormir Werte -----");

  if (isnan(temp) || isnan(humidity)) {
    Serial.println("Temperatur/Luftfeuchtigkeit: Fehler beim Lesen");
  } else {
    Serial.print("Temperatur: ");
    Serial.print(temp);
    Serial.println(" °C");

    Serial.print("Luftfeuchtigkeit: ");
    Serial.print(humidity);
    Serial.println(" %");
  }

  Serial.print("Mikrofon-Rohwert: ");
  Serial.println(micValue);

  Serial.print("Geräuschpegel geschätzt: ");
  Serial.print(dB, 1);
  Serial.println(" dB");

  Serial.println("-----------------------------");

////////////////////////////////////////////////////////////// JSON zusammenbauen

    JSONVar dataObject;
    dataObject["temperatur"] = temp;
    dataObject["luftfeuchtigkeit"] = humidity;
    dataObject["mikrofon_rohwert"] = micValue;
    dataObject["geraeusch_db"] = dB;
    String jsonString = JSON.stringify(dataObject);
    // String jsonString = "{\"sensor\":\"fiessling\", \"wert\":77}";  // stattdessen könnte man den JSON string auch so zusammenbauen

  
     ////////////////////////////////////////////////////////////// JSON string per HTTP POST request an den Server schicken (server2db.php)

    if (WiFi.status() == WL_CONNECTED) {                // Überprüfen, ob Wi-Fi verbunden ist
      // HTTP Verbindung starten und POST-Anfrage senden
      HTTPClient http;
      http.begin(serverURL);
      http.addHeader("Content-Type", "application/json");
      int httpResponseCode = http.POST(jsonString);

      // Prüfen der Antwort
      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("HTTP Response code: %d\n", httpResponseCode);
        Serial.println("Response: " + response);
      } else {
        Serial.printf("Error on sending POST: %d\n", httpResponseCode);
      }

      http.end();
    } else {
      Serial.println("WiFi Disconnected");
    }

  delay(3000);
}

void connectWiFi(){
    Serial.printf("\nVerbinde mit WLAN %s", ssid); // ssid ist const char*, kein String(ssid) nötig
    WiFi.begin(ssid, pass);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 40)
    { // Max 20 Versuche (10 Sekunden)
        delay(500);
        Serial.print(".");
        attempts++;
    }
    if (WiFi.status() == WL_CONNECTED){
        Serial.printf("\nWiFi verbunden: SSID: %s, IP-Adresse: %s\n", ssid, WiFi.localIP().toString().c_str());
        rgbLedWrite(led, 255, 0, 0);               // GRB: grün
    }
    else{
        Serial.println("\n WiFi Verbindung fehlgeschlagen!");
    }
}

bool is_wlan_connected(){
  if (WiFi.status() != WL_CONNECTED) {
    if (isWlanConnected == 1) {                     // War vorher verbunden?
      Serial.println("WiFi-Verbindung verloren, reconnect...");
      rgbLedWrite(led, 0, 255, 0);                  // GRB: Rot
      isWlanConnected = 0;
    }
    connectWiFi(); 
    return false;                                   // Loop wird abgebrochen
  }
  return true;                                      // WiFi ist da, Loop darf weiterlaufen
}