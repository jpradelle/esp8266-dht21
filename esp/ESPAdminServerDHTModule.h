#ifndef ESPADMINSSERVERDHTMODULE_H
#define ESPADMINSSERVERDHTMODULE_H

#include "ESPAdminServerModule.h"
#include <AsyncJson.h>
#include <ArduinoJson.h>

class ESPAdminServerDHTModule: public ESPAdminServerModule {
private:
  float m_humidityOffset, m_temperatureOffset;
  bool saveConfiguration();
  bool loadConfiguration();
  
public:
  ESPAdminServerDHTModule();
  void setup(AsyncWebServer &server);
  void loop(AsyncWebServer &server);
};

#endif
