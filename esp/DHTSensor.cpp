#include "DHTSensor.h"
#include "conf.h"
#include <DHT.h>
#include <arduino-timer.h>

Timer<2> _timer;
DHT _dht(0, 0);

bool _ranOnce = false;
float _humidity[] = {-100, -100, -100};
float _temperature[] = {-100, -100, -100};

bool runMeasurement(void *argument) {
  _humidity[0] = _humidity[1];
  _humidity[1] = _humidity[2];
  _humidity[2] = _dht.readHumidity();
  
  _temperature[0] = _temperature[1];
  _temperature[1] = _temperature[2];
  _temperature[2] = _dht.readTemperature();

  _ranOnce = true;
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
  if (!_ranOnce)
    return 50;
  
  if (_humidity[0] == -100)
    return _humidity[2];

  return (_humidity[0] + _humidity[1] + _humidity[2]) / 3;
}

float DHTSensor_getTemperature() {
  if (!_ranOnce)
    return 20;

  if (_temperature[0] == -100)
    return _temperature[2];

  return (_temperature[0] + _temperature[1] + _temperature[2]) / 3;
}

void DHTSensor_debug() {
  char str[50];
  snprintf(str, 50, "Humidity: %.2f%%\tTemperature: %.2f°C", DHTSensor_getHumidity(), DHTSensor_getTemperature());
  Serial.println(str);
}