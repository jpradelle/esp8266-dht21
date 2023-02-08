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
  m_server->on("/api/admin/getFile", HTTP_GET, [](AsyncWebServerRequest *request) {
    if (!request->hasParam("file")) {
      request->send(404, "text/plain", "Missing file parameter");
      return;
    }

    String fileName = request->getParam("file")->value();
    /*Serial.print("Request file ");
    Serial.println(fileName);*/
    request->send(LittleFS, fileName);
  });

  m_server->on("/api/admin/uploadFile", HTTP_POST, [](AsyncWebServerRequest *request) {
    request->send(200);
  }, [](AsyncWebServerRequest *request, String filename, size_t index, uint8_t *data, size_t len, bool final) {
    File file = LittleFS.open(filename, "w");
    if (!file) {
      Serial.print("file open failed ");
      Serial.println(filename);
      return;
    }

    /*
    if (!index) {
      Serial.printf("UploadStart: %s\n", filename.c_str());
    }*/
    
    for (size_t i = 0; i < len; i++) {
      // Serial.write(data[i]);
      file.write(data[i]);
    }
    
    if (final) {
      //Serial.printf("UploadEnd: %s, %u B\n", filename.c_str(), index + len);
      file.close();
    }
  });

  m_server->on("/api/admin/getConfigurations", HTTP_GET, [&](AsyncWebServerRequest *request) {
    AsyncResponseStream *response = request->beginResponseStream("application/json");
    DynamicJsonDocument jsonBuffer(100);
    JsonArray files = jsonBuffer.createNestedArray("files");
    for (short i = 0; i < m_moduleCount; i++) {
      if (m_modules[i]->getConfigurationFileName() != NULL)
        files.add(m_modules[i]->getConfigurationFileName());
    }
    serializeJson(jsonBuffer, *response);
    request->send(response);
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
