# ESP8266 with DHT21 sensore for Home Assistant
ESP8266 project to expose DHT21 sensor data.
Features:
* ESP8266 hosted admin UI
* MQTT sensor reporting

# Circuit
Doc TODO

# UI
NodeJS project ensure you have NodeJS with yarn setup
```bash
yarn install
yarn build
```

Copy UI files to arduino data
```bash
yarn arduino-copy
```

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

Upload data to ESP with https://github.com/esp8266/arduino-esp8266fs-plugin

