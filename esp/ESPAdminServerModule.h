#ifndef ESPADMINSERVERMODULE_H
#define ESPADMINSERVERMODULE_H

#include <ESPAsyncWebSrv.h>
#include <AsyncJson.h>
#include <ArduinoJson.h>
#include "ESPAdminServer.h"

class ESPAdminServer;

class ESPAdminServerModule {
protected:
  const char* m_configurationFile;
  bool saveConfiguration(JsonDocument &jsonDoc);
  bool loadConfiguration(JsonDocument &jsonDoc);
  void jsonResponse(AsyncWebServerRequest *request, JsonDocument &jsonDoc);
  
public:
  ESPAdminServerModule();
  ESPAdminServerModule(const char* configurationFile);
  virtual ~ESPAdminServerModule() {}
  virtual void setup(AsyncWebServer &server, WiFiClient &espClient, ESPAdminServer *adminServer) = 0;
  virtual void loop(AsyncWebServer &server, ESPAdminServer *adminServer) = 0;
  String getConfigurationFileName();
};

#endif
