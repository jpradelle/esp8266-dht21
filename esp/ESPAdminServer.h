#ifndef ESPADMINSERVER_H
#define ESPADMINSERVER_H

#include <ESPAsyncWebSrv.h>
#include "ESPAdminServerModule.h"

class ESPAdminServer {
private:
  ESPAdminServerModule* m_modules[5];
  short m_moduleCount, m_moduleSize;
  AsyncWebServer *m_server;
  bool m_resetRequested;
  
public:
  ESPAdminServer();
  ESPAdminServer(AsyncWebServer &server);
  void setup(WiFiClient &espClient);
  void loop();
  void addModule(ESPAdminServerModule &module);
};

#endif
