#include "ESPAdminServer.h"
#include <cstddef>
#include <LittleFS.h>

ESPAdminServer::ESPAdminServer() : m_moduleCount(0), m_server(NULL), m_resetRequested(false) {
  
}

ESPAdminServer::ESPAdminServer(AsyncWebServer &server) : m_moduleCount(0), m_server(&server), m_resetRequested(false) {
}

void ESPAdminServer::setup(WiFiClient &espClient) {
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

  m_server->on("/api/admin/uploadFile", HTTP_POST, [&](AsyncWebServerRequest *request) {
    Serial.print("File upload done");
    request->send(200);
  }, [&](AsyncWebServerRequest *request, String filename, size_t index, uint8_t *data, size_t len, bool final) {
    // Start file uploading
    if (!index) {
      Serial.print("File upload ");
      Serial.println(filename);
      
      request->_tempFile = LittleFS.open(filename, "w");
      if (!request->_tempFile) {
        Serial.print("file open failed ");
        Serial.println(filename);
        
        return;
      }
    }
    
    for (size_t i = 0; i < len; i++) {
      //Serial.write(data[i]);
      request->_tempFile.write(data[i]);
    }
    
    if (final) {
      Serial.printf("UploadEnd: %s, %u B\n", filename.c_str(), index + len);
      request->_tempFile.close();
      request->send(200);
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

  m_server->on("/api/admin/reset", HTTP_GET, [&](AsyncWebServerRequest *request) {
    m_resetRequested = true;
    request->send(200);
  });

  // Modules setup
  for (short i = 0; i < m_moduleCount; i++) {
    m_modules[i]->setup(*m_server, espClient);
  }
}

void ESPAdminServer::loop() {
  if (m_resetRequested) {
    Serial.println("Reset requested");
    delay(500);
    ESP.restart();
  }
  
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
