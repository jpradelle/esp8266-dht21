import fetch, {FormData, File} from 'node-fetch';
import fs from 'fs';

const address = process.argv[2];
if (!address) {
  console.error('Missing address argument');
  process.exit(1);
}
const filesToUpload = [
  {source: 'dist/index.html.gz', destination: '/index.html.gz'},
  {source: 'dist/index.js.gz', destination: '/index.js.gz'},
  {source: 'dist/material-icons.woff2', destination: '/material-icons.woff2'}
];

const uploadFile = (fileDesc, nextFiles) => {
  console.log('Uploading file ' + fileDesc.source + ' at ' + fileDesc.destination + ' on ' + address);

  const formData = new FormData();
  const abc = new File([fs.readFileSync(fileDesc.source)], fileDesc.source);
  formData.set('file', abc, fileDesc.destination);

  fetch('http://' + address + '/api/admin/uploadFile', {
    method: 'POST',
    body: formData
  })
      .then(uploadDone => {
        console.log('Done');
        if (nextFiles.length > 0) {
          uploadFile(nextFiles[0], nextFiles.slice(1));
        } else {
          console.log('File upload done: ' + filesToUpload.map(f => f.source).join(', '))
        }
      })
      .catch(error => {
        console.error("Transfer error for file " + fileDesc.source + ": ", error);
      });
}

uploadFile(filesToUpload[0], filesToUpload.slice(1));
