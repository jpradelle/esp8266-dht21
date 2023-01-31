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

// DHT conf
#define DHTTYPE DHT21
#define DHTPIN D4

// Temperature and humidity sampling frequency
#define INTERVAL 20 * 1000

#endif