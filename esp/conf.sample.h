#ifndef CONF_H
#define CONF_H

#include <DHT.h>

// WIFI conf
#define WIFI_SSID "WIFI-SSID"
#define WIFI_PASSWORD "WIFI-PASSWORD"
#define WIFI_LOCAL_IP 192, 168, 100, 211
#define WIFI_GATEWAY 192, 168, 100, 1
#define WIFI_SUBNET 255, 255, 255, 0
#define WIFI_PRIMARY_DNS 192, 168, 100, 1
#define WIFI_SECONDARY_DNS 192, 168, 100, 1

// MQTT
#define MQTT_ADDRESS "192.168.100.1"
#define MQTT_PORT 1883
#define MQTT_USER "MQTT_USER"
#define MQTT_PASSWORD "MQTT_PASSWORD"
#define MQTT_CLIENT_ID "ESP8266-001" // Client id (can be random)
#define MQTT_OUT_TOPIC "ESP8266-001/temperatureAndHumidity"
#define MQTT_PUBLISH_INTERVAL 60 * 1000

// DHT conf
#define DHTTYPE DHT21
#define DHTPIN D4
#define DHT_INTERVAL 10 * 1000 // Temperature and humidity sampling frequency
#define FAKE_TEST_DATA false // Don't read DHT sensor, simulate fake data

#endif
