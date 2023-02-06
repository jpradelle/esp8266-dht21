#include "ESPAdminServer.h"
#include <cstddef>
#include <LittleFS.h>

ESPAdminServer::ESPAdminServer() : m_moduleCount(0), m_server(NULL) {
  
}

ESPAdminServer::ESPAdminServer(AsyncWebServer &server) : m_moduleCount(0), m_server(&server) {
}

void ESPAdminServer::setup() {
  // UI content
  m_server->on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    AsyncWebServerResponse *response = request->beginResponse(LittleFS, "/index.html.gz", "text/html");
    response->addHeader("Content-Encoding", "gzip");
    request->send(response);
  });
  
  m_server->on("/index.js", HTTP_GET, [](AsyncWebServerRequest *request) {
    AsyncWebServerResponse *response = request->beginResponse(LittleFS, "/index.js.gz", "application/javascript");
    response->addHeader("Content-Encoding", "gzip");
    request->send(response);
  });
  
  m_server->on("/material-icons.woff2", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(LittleFS, "/material-icons.woff2");
  });

  // Admin API
  m_server->on("/api/admin/getFile", HTTP_GET, [&](AsyncWebServerRequest *request) {
    if (!request->hasParam("file")) {
      request->send(404, "text/plain", "Missing file parameter");
      return;
    }

    String fileName = request->getParam("file")->value();
    /*Serial.print("Request file ");
    Serial.println(fileName);*/
    request->send(LittleFS, fileName);
  });

  // Modules setup
  for (short i = 0; i < m_moduleCount; i++) {
    m_modules[i]->setup(*m_server);
  }
}

void ESPAdminServer::loop() {
  for (short i = 0; i < m_moduleCount; i++) {
    m_modules[i]->loop(*m_server);
  }
}

void ESPAdminServer::addModule(ESPAdminServerModule &module) {
  if (m_moduleCount >= 5) {
    Serial.println("Too many modules registered, ignoring");
    return;
  }
  
  m_modules[m_moduleCount++] = &module;
}
