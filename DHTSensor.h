#ifndef DHTSENSOR_H
#define DHTSENSOR_H

#include <Arduino.h>

void DHTSensor_init(uint8_t type, uint8_t pin);
void DHTSensor_update();
void DHTSensor_debug();
float DHTSensor_getTemperature();
float DHTSensor_getHumidity();

#endif