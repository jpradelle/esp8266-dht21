#include "Logger.h"

#include <cstddef>

Logger::Logger() : m_logWs(NULL) {
  
}

Logger::Logger(AsyncWebSocket *logWs) : m_logWs(logWs) {
  
}


void Logger::print(String str) {
  Serial.print(str);
  m_logWs->textAll(str);
}

void Logger::print(int i) {
  print(String(i));
}

void Logger::print(float i) {
  print(String(i));
}

void Logger::println(String str) {
  print(str + "\n");
}
