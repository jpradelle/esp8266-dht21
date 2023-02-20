#include "ESPAdminServerModule.h"

#include <cstddef>
#include <LittleFS.h>

ESPAdminServerModule::ESPAdminServerModule() : m_configurationFile(NULL) {
  
}

ESPAdminServerModule::ESPAdminServerModule(const char* configurationFile) : m_configurationFile(configurationFile) {
  
}

bool ESPAdminServerModule::saveConfiguration(JsonDocument &jsonDoc) {
  File file = LittleFS.open(m_configurationFile, "w");
  if (!file) {
    Serial.print("file '");
    Serial.print(m_configurationFile);
    Serial.print("' open failed for save");
    
    return false;
  }
  
  serializeJson(jsonDoc, file);
  file.close();
  
  return true;
}


bool ESPAdminServerModule::loadConfiguration(JsonDocument &jsonDoc) {
  File file = LittleFS.open(m_configurationFile, "r");
  if (!file) {
    Serial.print("file '");
    Serial.print(m_configurationFile);
    Serial.print("' open failed for save");
    
    return false;
  }
  
  DeserializationError err = deserializeJson(jsonDoc, file);
  if (err) {
    Serial.print("file '");
    Serial.print(m_configurationFile);
    Serial.print("' deserialization error: ");
    Serial.println(err.c_str());

    return false;
  }
  
  file.close();
  
  return true;
}

void ESPAdminServerModule::jsonResponse(AsyncWebServerRequest *request, JsonDocument &jsonDoc) {
  AsyncResponseStream *response = request->beginResponseStream("application/json");
  serializeJson(jsonDoc, *response);
  request->send(response);
}

String ESPAdminServerModule::getConfigurationFileName() {
  return String(m_configurationFile);
}
