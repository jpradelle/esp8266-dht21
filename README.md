# ESP8266 with DHT21 sensore for Home Assistant
ESP8266 project to expose DHT21 sensor data.
Features:
* ESP8266 hosted admin UI
* MQTT sensor reporting
* Admin UI
  * Configuration update
  * Configuration backup and restore

# Circuit
Doc TODO

# UI
NodeJS project ensure you have NodeJS with yarn setup
```bash
cd ui
yarn install
yarn build
```

# Upload UI on ESP board
### Either copy UI files to arduino IDE data with
```bash
yarn arduino-copy
```
And then upload data to ESP with https://github.com/esp8266/arduino-esp8266fs-plugin

Warning, this would erase all configuration made on device via UI.

### Or upload via WiFi
You need your ESP Server flashed and running, in `ui` folder run
```bash
yarn flash 192.168.100.212
```
(Update address to fit your needs)

# ESP8266 Server
Using ArduinoIDE, open esp/esp.ino project

Install needed library on Arduino IDE:
* https://github.com/contrem/arduino-timer
* https://github.com/adafruit/DHT-sensor-library
* https://github.com/knolleary/pubsubclient
* https://github.com/me-no-dev/ESPAsyncWebServer
* https://github.com/bblanchon/ArduinoJson

Copy esp/conf.sample.h to esp/conf.h and update configuration.

Build and flash it
