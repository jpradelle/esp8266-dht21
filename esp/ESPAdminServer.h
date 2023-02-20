#ifndef ESPADMINSERVER_H
#define ESPADMINSERVER_H

#include <ESPAsyncWebSrv.h>
#include "ESPAdminServerModule.h"
#include "Logger.h"

class ESPAdminServerModule;

class ESPAdminServer {
private:
  ESPAdminServerModule* m_modules[5];
  short m_moduleCount, m_moduleSize;
  AsyncWebServer *m_server;
  bool m_resetRequested;
  AsyncWebSocket *m_logWs;
  Logger m_logger;
  
public:
  ESPAdminServer(AsyncWebServer &server);
  virtual ~ESPAdminServer();
  
  void setup(WiFiClient &espClient);
  void loop();
  void addModule(ESPAdminServerModule &module);
  Logger* getLogger();
  void fillJsonFiles(Dir& dir, String path, JsonArray& arrayBuffer);
};

#endif
