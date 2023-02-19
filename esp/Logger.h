#ifndef LOGGER_H
#define LOGGER_H

#include <ESPAsyncWebSrv.h>

class Logger {
protected:
  AsyncWebSocket *m_logWs;
  
public:
  Logger();
  Logger(AsyncWebSocket *m_logWs);
  virtual ~Logger() {}

  void print(String str);
  void print(int i);
  void print(float i);
  void println(String str);
};

#endif
