#include "ESPAdminServer.h"
#include <cstddef>
#include <LittleFS.h>
#include <Updater.h>

ESPAdminServer::ESPAdminServer(AsyncWebServer &server) : m_moduleCount(0), m_server(&server), m_resetRequested(false) {
  m_logWs = new AsyncWebSocket("/wsApi/log");
  m_logger = Logger(m_logWs);
}

ESPAdminServer::~ESPAdminServer() {
  delete m_logWs;
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
  m_server->on("/api/admin/getFile", HTTP_GET, [&](AsyncWebServerRequest *request) {
    if (!request->hasParam("file")) {
      m_logger.println("[404] /api/admin/getFile Missing file parameter");
      request->send(404, "text/plain", "Missing file parameter");
      return;
    }

    String fileName = request->getParam("file")->value();
    m_logger.println("[200] /api/admin/getFile of file " + fileName);
    request->send(LittleFS, fileName);
  });

  m_server->on("/api/admin/uploadFile", HTTP_POST, [&](AsyncWebServerRequest *request) {
    request->send(200, "application/json", "{\"success\": true}");
  }, [&](AsyncWebServerRequest *request, String filename, size_t index, uint8_t *data, size_t len, bool final) {
    // Start file uploading
    if (!index) {
      m_logger.println("/api/admin/uploadFile init upload of file " + filename);
      
      request->_tempFile = LittleFS.open(filename, "w");
      if (!request->_tempFile) {
        m_logger.println("/api/admin/uploadFile fail to open file " + filename);
        
        return;
      }
    }
    
    for (size_t i = 0; i < len; i++) {
      //Serial.write(data[i]);
      request->_tempFile.write(data[i]);
    }
    
    if (final) {
      request->_tempFile.close();
      m_logger.println("[200] /api/admin/uploadFile file uploaded " + filename + " " + (index + len) + " B");
      request->send(200);
    }
  });
  
  m_server->on("/api/admin/deleteFile", HTTP_POST, [&](AsyncWebServerRequest *request) {
    if (!request->hasParam("file", true)) {
      m_logger.println("[404] /api/admin/deleteFile Missing file parameter");
      request->send(404, "text/plain", "Missing file parameter");
      return;
    }

    String fileName = request->getParam("file", true)->value();
    LittleFS.remove(fileName);
    m_logger.println("[200] /api/admin/deleteFile of file " + fileName);
    
    request->send(200, "application/json", "{\"success\": true}");
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
    m_logger.println("[200] /api/admin/getConfigurations");
    request->send(response);
  });

  m_server->on("/api/admin/getFileSystemInfo", HTTP_GET, [&](AsyncWebServerRequest *request) {
    AsyncResponseStream *response = request->beginResponseStream("application/json");
    DynamicJsonDocument jsonBuffer(10240);

    FSInfo fsInfo;
    LittleFS.info(fsInfo);
    jsonBuffer["totalSize"] = fsInfo.totalBytes;
    jsonBuffer["freeSpace"] = fsInfo.totalBytes - fsInfo.usedBytes;
    JsonArray files = jsonBuffer.createNestedArray("files");
    /*for (short i = 0; i < m_moduleCount; i++) {
      if (m_modules[i]->getConfigurationFileName() != NULL)
        files.add(m_modules[i]->getConfigurationFileName());
    }*/
    Dir dir = LittleFS.openDir("/");
    fillJsonFiles(dir, "", files);
    
    serializeJson(jsonBuffer, *response);
    m_logger.println("[200] /api/admin/getFileSystemInfo");
    request->send(response);
  });

  m_server->on("/api/admin/reset", HTTP_GET, [&](AsyncWebServerRequest *request) {
    m_resetRequested = true;
    m_logger.println("[200] /api/admin/reset");
    request->send(200);
  });
  
  m_server->on(
      "/api/admin/updateFirmware",
      HTTP_POST,
      [](AsyncWebServerRequest *request) {},
      [&](AsyncWebServerRequest *request, const String& filename, size_t index, uint8_t *data, size_t len, bool final) {
        if (!index) {
          m_logger.println("Update firmware requested " + filename);
          size_t contentLen = request->contentLength();
          Update.runAsync(true);
          if (!Update.begin(contentLen, U_FLASH)) {
            m_logger.println(Update.getErrorString());
          }
        }
      
        if (Update.write(data, len) != len) {
          m_logger.println(Update.getErrorString());
        } else {
          m_logger.println("Firmware update progress " + String((Update.progress() * 100) / Update.size()));
        }
      
        if (final) {
          AsyncWebServerResponse *response = request->beginResponse(302, "text/plain", "Please wait while the device reboots");
          response->addHeader("Refresh", "20");
          response->addHeader("Location", "/");
          request->send(response);
          
          if (!Update.end(true)){
            m_logger.println(Update.getErrorString());
          } else {
            m_logger.println("Firmware update complete, rebooting ...");
            m_resetRequested = true;
          }
        }
      }
  );

  // Web socket
  m_logWs->onEvent([&](AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
    switch (type) {
      case WS_EVT_CONNECT:
        m_logger.println("/wsApi/log WebSocket client " + String(client->id()) + " connected from " + client->remoteIP().toString());
        break;
      case WS_EVT_DISCONNECT:
        m_logger.print("/wsApi/log WebSocket client " + String(client->id()) + " disconnected");
        break;
      case WS_EVT_DATA:
      case WS_EVT_PONG:
      case WS_EVT_ERROR:
        break;
    }
  });
  m_server->addHandler(m_logWs);

  // Modules setup
  for (short i = 0; i < m_moduleCount; i++) {
    m_modules[i]->setup(*m_server, espClient, this);
  }
}

void ESPAdminServer::loop() {
  if (m_resetRequested) {
    m_logger.print("Reset requested");
    delay(500);
    ESP.restart();
  }

  m_logWs->cleanupClients();
  
  for (short i = 0; i < m_moduleCount; i++) {
    m_modules[i]->loop(*m_server, this);
  }
}

void ESPAdminServer::addModule(ESPAdminServerModule &module) {
  if (m_moduleCount >= 5) {
    Serial.println("Too many modules registered, ignoring");
    return;
  }
  
  m_modules[m_moduleCount++] = &module;
}

Logger* ESPAdminServer::getLogger() {
  return &m_logger;
}

void ESPAdminServer::fillJsonFiles(Dir& dir, String path, JsonArray& arrayBuffer) {
  while (dir.next()) {
    if (dir.isFile()) {
      JsonObject fileDesc = arrayBuffer.createNestedObject();
      fileDesc["file"] = path + "/" + dir.fileName();
      fileDesc["size"] = dir.fileSize();
    } else if (dir.isDirectory()) {
      Dir subDir = LittleFS.openDir(path + "/" + dir.fileName());
      fillJsonFiles(subDir, path + "/" + dir.fileName(), arrayBuffer);
    }
  }
}
