#ifndef ESPADMINSERVERMODULE_H
#define ESPADMINSERVERMODULE_H

#include <ESPAsyncWebSrv.h>
#include <AsyncJson.h>
#include <ArduinoJson.h>

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
  virtual void setup(AsyncWebServer &server) = 0;
  virtual void loop(AsyncWebServer &server) = 0;
};

#endif
