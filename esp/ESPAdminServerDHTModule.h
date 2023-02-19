#ifndef ESPADMINSSERVERDHTMODULE_H
#define ESPADMINSSERVERDHTMODULE_H

#include "ESPAdminServerModule.h"
#include <AsyncJson.h>
#include <ArduinoJson.h>
#include <arduino-timer-cpp17.hpp>
#include <PubSubClient.h>
#include <DHT.h>
#include "Logger.h"

class ESPAdminServerDHTModule: public ESPAdminServerModule {
private:
  float m_humidityOffset = 0, m_temperatureOffset = 0;
  Timers::TimerSet<2> m_timer;
  PubSubClient *m_mqttClient;
  DHT *m_dht;
  float m_dhtHumidity[6];
  float m_dhtTemperature[6];
  int m_dhtIndex = 0;
  
  bool saveConfiguration();
  bool loadConfiguration();
  float computeTemperature();
  float computeHumidity();
  float computeData(float *data);
  Logger *m_logger;
  
public:
  ESPAdminServerDHTModule();
  virtual ~ESPAdminServerDHTModule();
  void setup(AsyncWebServer &server, WiFiClient &espClient, ESPAdminServer *adminServer);
  void loop(AsyncWebServer &server, ESPAdminServer *adminServer);
};

#endif
