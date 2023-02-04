#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebSrv.h>
#include <DHT.h>
#include <PubSubClient.h>
#include <arduino-timer.h>
#include <ArduinoOTA.h>
#include <AsyncJson.h>
#include <ArduinoJson.h>
#include "DHTSensor.h"
#include "conf.h"

// Listen for HTTP requests on standard port 80
AsyncWebServer server(80);

WiFiClient espClient;
PubSubClient mqttClient(espClient);

Timer<2> mqttPublishTimer;

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

bool mqttPublish(void*) {
  if (!mqttClient.connected()) {
    Serial.print("Attempting MQTT connection on ");
    Serial.print(MQTT_ADDRESS);
    Serial.print(":");
    Serial.print(MQTT_PORT);
    Serial.print(" ... ");
    // Attempt to connect
    if (mqttClient.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASSWORD)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.println(mqttClient.state());
    }
  }

  if (mqttClient.connected()) {
      // Once connected, publish an announcement...
      char str[50];
      snprintf(str, 50, "{\"humidity\": %.2f, \"temperature\": %.2f}", DHTSensor_getHumidity(), DHTSensor_getTemperature());

      mqttClient.publish(MQTT_OUT_TOPIC, str);
  }

  return true;
}

void setup() {
  Serial.begin(9600);

  Serial.println("DHT Server");
  Serial.println("");

  wifiConnect();

  // Initialize SPIFFS
  if(!SPIFFS.begin()){
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }
  
  ArduinoOTA.begin();

  // Handle http requests
  // UI content
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    AsyncWebServerResponse *response = request->beginResponse(SPIFFS, "/index.html.gz", "text/html");
    response->addHeader("Content-Encoding", "gzip");
    request->send(response);
  });
  
  server.on("/index.js", HTTP_GET, [](AsyncWebServerRequest *request) {
    AsyncWebServerResponse *response = request->beginResponse(SPIFFS, "/index.js.gz", "application/javascript");
    response->addHeader("Content-Encoding", "gzip");
    request->send(response);
  });
  
  server.on("/material-icons.woff2", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(SPIFFS, "/material-icons.woff2");
  });

  server.on("/api/sensorData", HTTP_GET, [](AsyncWebServerRequest *request){
    AsyncResponseStream *response = request->beginResponseStream("application/json");
    DynamicJsonDocument jsonBuffer(50);
    jsonBuffer["temperature"] = DHTSensor_getTemperature();
    jsonBuffer["humidity"] = DHTSensor_getHumidity();
    serializeJson(jsonBuffer, *response);
    request->send(response);
  });

  // Start the web server
  server.begin();
  Serial.println("HTTP server started");

  // MQTT config
  mqttClient.setServer(MQTT_ADDRESS, MQTT_PORT);
  mqttPublishTimer.every(MQTT_PUBLISH_INTERVAL, mqttPublish);

  DHTSensor_init(DHTPIN, DHTTYPE);
}

void loop() {
  DHTSensor_update();
  mqttPublishTimer.tick();
  ArduinoOTA.handle();
  delay(1);
}
