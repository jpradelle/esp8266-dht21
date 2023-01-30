#include "DHTSensor.h"
#include <arduino-timer.h>

#define INTERVAL 2 * 1000

Timer<2> _timer;
DHT _dht(0, 0);

bool ranOnce = false;
float _humidity[] = {-100, -100, -100};
float _temperature[] = {-100, -100, -100};

bool runMeasurement(void *argument) {
  _humidity[0] = _humidity[1];
  _humidity[1] = _humidity[2];
  _humidity[2] = _dht.readHumidity();
  
  _temperature[0] = _temperature[1];
  _temperature[1] = _temperature[2];
  _temperature[2] = _dht.readTemperature();

  ranOnce = true;
  DHTSensor_debug();
  
  return true;
}

void DHTSensor_init(uint8_t type, uint8_t pin) {
  _dht = DHT(type, pin);
  _dht.begin();
  runMeasurement(0);
  _timer.every(INTERVAL, runMeasurement);
}

void DHTSensor_update() {
  _timer.tick();
}

float DHTSensor_getHumidity() {
  if (!ranOnce)
    return 50;
  
  if (_humidity[0] == -100)
    return _humidity[2];

  return (_humidity[0] + _humidity[1] + _humidity[2]) / 3;
}

float DHTSensor_getTemperature() {
  if (!ranOnce)
    return 20;

  if (_temperature[0] == -100)
    return _temperature[2];

  return (_temperature[0] + _temperature[1] + _temperature[2]) / 3;
}

void DHTSensor_debug() {
  char strHumidity[10], strTemperature[10];
  dtostrf(DHTSensor_getHumidity(), 1, 2, strHumidity);
  dtostrf(DHTSensor_getTemperature(), 1, 2, strTemperature);

  Serial.print("Humidity: ");
  Serial.print(strHumidity);
  Serial.print(" %\t");
  Serial.print("Temperature: ");
  Serial.print(strTemperature);
  Serial.println(" °C");
}