const EspOTA = require('esp-ota');
const filesToUpload = [
  'dist/index.html',
  'dist/index.js',
  'dist/material-icons.woff2'
];
const address = '192.168.100.212';
const port = 8266;

const esp = new EspOTA();

esp.on('state', function (state) {
  console.log("Current state of transfer: ", state);
});

esp.on('progress', function (current, total) {
  console.log("Transfer progress: " + Math.round(current / total * 100) + "%");
});

const uploadFile = (file, nextFiles) => {
  console.log('Uploading file ' + file);
  esp.uploadFile(file, address, port, EspOTA.SPIFFS)
      .then(function () {
        console.log("Done: " + file);
        if (nextFiles.length > 0) {
          setTimeout(() => {
            uploadFile(nextFiles[0], nextFiles.slice(1));
          }, 100);
        }
      })
      .catch(function (error) {
        console.error("Transfer error for file " + file + ": ", error);
      });
}

uploadFile(filesToUpload[0], filesToUpload.slice(1))