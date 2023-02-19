#include "ESPAdminServerDHTModule.h"

#include <LittleFS.h>
#include "conf.h"

ESPAdminServerDHTModule::ESPAdminServerDHTModule() :
    ESPAdminServerModule("/conf/dht.json"),
    m_dht(NULL),
    m_mqttClient(NULL),
    m_dhtHumidity{-100, -100, -100, -100, -100, -100},
    m_dhtTemperature{-100, -100, -100, -100, -100, -100},
    m_logger(NULL) {
  
}

ESPAdminServerDHTModule::~ESPAdminServerDHTModule() {
  if (m_dht != NULL)
    delete m_dht;
  if (m_mqttClient != NULL)
    delete m_mqttClient;
}

void ESPAdminServerDHTModule::setup(AsyncWebServer &server, WiFiClient &espClient, ESPAdminServer *adminServer) {
  m_logger = adminServer->getLogger();
  loadConfiguration();
  
  // Sensor data
  server.on("/api/dht/sensorData", HTTP_GET, [&](AsyncWebServerRequest *request){
    AsyncResponseStream *response = request->beginResponseStream("application/json");
    DynamicJsonDocument jsonBuffer(50);
    jsonBuffer["temperature"] = computeTemperature();
    jsonBuffer["humidity"] = computeHumidity();
    serializeJson(jsonBuffer, *response);
    request->send(response);
  });

  // Sensor configuration
  server.on("/api/dht/getConfiguration", HTTP_GET, [&](AsyncWebServerRequest *request){
    AsyncResponseStream *response = request->beginResponseStream("application/json");
    DynamicJsonDocument jsonBuffer(50);
    jsonBuffer["temperatureOffset"] = m_temperatureOffset;
    jsonBuffer["humidityOffset"] = m_humidityOffset;
    serializeJson(jsonBuffer, *response);
    request->send(response);
  });

  server.on("/conf/dht.json", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(LittleFS, "/conf/dht.json");
  });
  
  AsyncCallbackJsonWebHandler* handler = new AsyncCallbackJsonWebHandler("/api/dht/updateConfiguration", [&](AsyncWebServerRequest *request, JsonVariant &json) {
    const JsonObject& jsonObj = json.as<JsonObject>();
    m_temperatureOffset = jsonObj["temperatureOffset"];
    m_humidityOffset = jsonObj["humidityOffset"];

    bool success = saveConfiguration();
    
    DynamicJsonDocument jsonBuffer(25);
    jsonBuffer["success"] = success;
    ESPAdminServerModule::jsonResponse(request, jsonBuffer);
  });
  server.addHandler(handler);

  // DHT Sensor init and timer setup
  m_dht = new DHT(DHTPIN, DHTTYPE);
  m_dht->begin();
  m_timer.now_and_every(DHT_INTERVAL, [&]() {
    #if FAKE_TEST_DATA
    m_dhtHumidity[m_dhtIndex] = random(40, 60);
    m_dhtTemperature[m_dhtIndex] = random(18, 22);
    #else
    m_dhtHumidity[m_dhtIndex] = m_dht->readHumidity();
    m_dhtTemperature[m_dhtIndex] = m_dht->readTemperature();
    #endif

    m_logger->println("[DHT] raw measure: " + String(m_dhtTemperature[m_dhtIndex]) + "°C, " + String(m_dhtHumidity[m_dhtIndex]) + "%");
    
    m_dhtIndex = (m_dhtIndex + 1) % 6;
    
    return Timers::TimerStatus::repeat;
  });

  // MQTT config
  m_mqttClient = new PubSubClient(espClient);
  m_mqttClient->setServer(MQTT_ADDRESS, MQTT_PORT);
  m_timer.every(MQTT_PUBLISH_INTERVAL, [&]() {
    if (!m_mqttClient->connected()) {
      m_logger->print("[DHT] Attempting MQTT connection on " + String(MQTT_ADDRESS) + ":" + String(MQTT_PORT) + " ... ");
      // Attempt to connect
      if (m_mqttClient->connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASSWORD)) {
        m_logger->println("connected");
      } else {
        Serial.print("failed, rc=");
        m_logger->println(m_mqttClient->state());
      }
    }

    if (m_mqttClient->connected()) {
      // Once connected, publish an announcement...
      char str[50];
      snprintf(str, 50, "{\"humidity\": %.2f, \"temperature\": %.2f}", computeHumidity(), computeTemperature());
      m_logger->println("[DHT] MQTT Publish " + String(str));

      m_mqttClient->publish(MQTT_OUT_TOPIC, str);
    }
    
    return Timers::TimerStatus::repeat;
  });
}

void ESPAdminServerDHTModule::loop(AsyncWebServer &server, ESPAdminServer *adminServer) {
  m_timer.tick();
}

bool ESPAdminServerDHTModule::saveConfiguration() {
  DynamicJsonDocument jsonBuffer(50);
  jsonBuffer["tempOffset"] = m_temperatureOffset;
  jsonBuffer["humOffset"] = m_humidityOffset;

  return ESPAdminServerModule::saveConfiguration(jsonBuffer);
}

bool ESPAdminServerDHTModule::loadConfiguration() {
  StaticJsonDocument<100> jsonDoc;
  if (!ESPAdminServerModule::loadConfiguration(jsonDoc))
    return false;

  m_temperatureOffset = jsonDoc["tempOffset"];
  m_humidityOffset = jsonDoc["humOffset"];

  return true;
}


float ESPAdminServerDHTModule::computeHumidity() {
  if (m_dhtHumidity[0] == -100)
    return 50;
  
  if (m_dhtHumidity[5] == -100)
    return m_dhtHumidity[0];

  float value = computeData(m_dhtHumidity) + m_humidityOffset;

  /*
  Serial.print("Hum: [");
  for (int i = 0; i < 6; i++) {
    Serial.print(m_dhtHumidity[i]);
    Serial.print(", ");
  }
  Serial.print("] -> ");
  Serial.println(value);
  */

  return value;
}

float ESPAdminServerDHTModule::computeTemperature() {
  if (m_dhtTemperature[0] == -100)
    return 20;
    
  if (m_dhtTemperature[5] == -100)
    return m_dhtTemperature[0];

  float value = computeData(m_dhtTemperature) + m_temperatureOffset;

  /*
  Serial.print("Temp: [");
  for (int i = 0; i < 6; i++) {
    Serial.print(m_dhtTemperature[i]);
    Serial.print(", ");
  }
  Serial.print("] -> ");
  Serial.println(value);
  */

  return value;
}

float ESPAdminServerDHTModule::computeData(float *data) {
  // Filter out max and min value, compute average of 4 other values
  short lowestIndex = 0;
  short highestIndex = 0;

  for (short i = 1; i < 6; i++) {
    if (data[i] < data[lowestIndex])
      lowestIndex = i;
    if (data[i] > data[highestIndex])
      highestIndex = i;
  }

  // If all 6 values are the same remove 1st and 2nd
  if (lowestIndex == 0 && highestIndex == 0)
    highestIndex = 1;

  /*
  Serial.print("Filter out lowest ");
  Serial.print(lowestIndex);
  Serial.print(" and highest ");
  Serial.println(highestIndex);
  */

  float average = 0;
  for (short i = 0; i < 6; i++) {
    if (i != lowestIndex && i != highestIndex)
      average += data[i];
  }

  return average / 4;
}
