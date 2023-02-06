#include "ESPAdminServerDHTModule.h"

#include <LittleFS.h>

ESPAdminServerDHTModule::ESPAdminServerDHTModule() : ESPAdminServerModule("/conf/dht.json"), m_humidityOffset(0), m_temperatureOffset(0) {
  
}

void ESPAdminServerDHTModule::setup(AsyncWebServer &server) {
  loadConfiguration();
  
  // Sensor data
  server.on("/api/dht/sensorData", HTTP_GET, [&](AsyncWebServerRequest *request){
    AsyncResponseStream *response = request->beginResponseStream("application/json");
    DynamicJsonDocument jsonBuffer(50);
    /*
    jsonBuffer["temperature"] = DHTSensor_getTemperature() + m_temperatureOffset;
    jsonBuffer["humidity"] = DHTSensor_getHumidity() + m_humidityOffset;
    /*/
    jsonBuffer["temperature"] = 20 + m_temperatureOffset;
    jsonBuffer["humidity"] = 50 + m_humidityOffset;
    //*/
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
}

void ESPAdminServerDHTModule::loop(AsyncWebServer &server) {
  
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
