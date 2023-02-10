#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebSrv.h>
#include <ArduinoOTA.h>
#include <AsyncJson.h>
#include <ArduinoJson.h>
#include <LittleFS.h>
#include "ESPAdminServer.h"
#include "ESPAdminServerDHTModule.h"
#include "conf.h"

// Listen for HTTP requests on standard port 80
AsyncWebServer server(80);

WiFiClient espClient;
ESPAdminServer espAdminServer;
ESPAdminServerDHTModule dhtModule;

bool wifiConnect() {
  // Connect to your WiFi network
  if (!WiFi.config(
      IPAddress(WIFI_LOCAL_IP),
      IPAddress(WIFI_GATEWAY),
      IPAddress(WIFI_SUBNET),
      IPAddress(WIFI_PRIMARY_DNS),
      IPAddress(WIFI_SECONDARY_DNS))) {
    Serial.println("STA Failed to configure");
    return false;
  }
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting");

  // Wait for successful connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to: ");
  Serial.println(WIFI_SSID);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.println("");
  return true;
}

void setup() {
  Serial.begin(9600);

  Serial.println("DHT Server");
  Serial.println("");

  wifiConnect();

  // Initialize LittleFS
  if (!LittleFS.begin()) {
    Serial.println("An Error has occurred while mounting LittleFS");
    return;
  }
  
  ArduinoOTA.begin();

  espAdminServer = ESPAdminServer(server);
  espAdminServer.addModule(dhtModule);
  espAdminServer.setup(espClient);

  // Start the web server
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  ArduinoOTA.handle();
  espAdminServer.loop();
  delay(1);
}
