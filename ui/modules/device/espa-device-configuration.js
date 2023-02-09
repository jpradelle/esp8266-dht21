import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import style from './espa-device-configuration.scss';
import {EspaNotification} from '../../utils/espa-notification.js';
import {when} from 'lit/directives/when.js';

@customElement('espa-device-configuration')
export class EspaDeviceConfiguration extends LitElement {
  static styles = style;

  @state()
  __configurationContent;

  @state()
  __reloadDialogOpen = false;

  render() {
    return html`
      <espa-page-box heading="System configuration">
        <mwc-button @click="${this.__exportConfiguration}" outlined>Export Configuration</mwc-button>
        
        <div class="import">
          <input type="file" name="configurationFile"/>
          <mwc-button @click="${this.__importConfiguration}" outlined>Import Configuration</mwc-button>
        </div>
      </espa-page-box>
      
      ${when(this.__reloadDialogOpen, () => html`
        <mwc-dialog open escapeKeyAction="" scrimClickAction="">
          Configuration imported, restarting device
          <mwc-button slot="primaryAction" @click="${this.__reload}">Reload</mwc-button>
        </mwc-dialog>
      `)}
    `;
  }

  async __exportConfiguration() {
    const res = await fetch('/api/admin/getConfigurations');
    const json = await res.json();

    const configurationContent = await Promise.all(json.files.map(async file => {
      const confFile = await fetch('/api/admin/getFile?file=' + file);

      return {
        file,
        content: await confFile.text()
      };
    }));

    // Download conf content
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(configurationContent)));
    const date = new Date().toISOString().split('T')[0]
    downloadLink.setAttribute('download', 'esp-admin-conf-' + date + '.json');

    downloadLink.style.display = 'none';
    this.shadowRoot.appendChild(downloadLink);

    downloadLink.click();

    this.shadowRoot.removeChild(downloadLink);
  }

  __importConfiguration() {
    const fileInput = this.shadowRoot.querySelector('input[name=configurationFile]');
    if (fileInput.files.length < 1) {
      EspaNotification.error(this, 'Please select a file to import');
      return;
    }

    const fileReader = new FileReader();
    const uploadTasks = [];
    fileReader.onload = () => {
      const configurations = JSON.parse(fileReader.result);
      configurations.forEach(conf => {
        const blob = new Blob([conf.content], {type: "text/plain"});
        const file = new File([blob], conf.file);
        const formData  = new FormData();
        formData.append('file', file);

        uploadTasks.push(fetch('/api/admin/uploadFile', {
          method: 'POST',
          body: formData
        }));
      });

      Promise.all(uploadTasks)
          .then(() => {
              fetch('/api/admin/reset')
                  .then(() => {
                    this.__reloadDialogOpen = true;
                  })
          .catch(ex => {
            EspaNotification.error(this, 'Error during configuration import ' + ex.message);
          });
      })

    }

    fileReader.readAsText(fileInput.files[0]);
  }

  __reload() {
    window.location.reload();
  }
}