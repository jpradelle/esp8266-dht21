import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import style from './espa-device-configuration.scss';

@customElement('espa-device-configuration')
class EspaDeviceConfiguration extends LitElement {
  static styles = style;

  @state()
  __configurationContent;

  render() {
    return html`
      <espa-page-box title="Configuration">
        <mwc-button @click="${this.__exportConfiguration}" outlined>Export Configuration</mwc-button>
        
        <div class="import">
          <input type="file" name="configurationFile"/>
          <mwc-button @click="${this.__importConfiguration}" outlined>Import Configuration</mwc-button>
        </div>
      </espa-page-box>
    `;
  }

  async __exportConfiguration() {
    const res = await fetch('/api/admin/getConfigurations');
    const json = await res.json();
    console.log(json);

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

    const fileReader = new FileReader();
    fileReader.onload = () => {
      const configurations = JSON.parse(fileReader.result);
      configurations.forEach(conf => {
        console.log(conf.file);
        console.log(conf.content);

        const blob = new Blob([conf.content], {type: "text/plain"});
        const file = new File([blob], conf.file);
        const formData  = new FormData();
        formData.append('file', file);

        fetch('/api/admin/uploadFile', {
          method: "POST",
          body: formData
        })
            .then(res => console.log('ok'))
            .catch(ex => console.log('Error ', ex));
      });
    }

    fileReader.readAsText(fileInput.files[0]);
  }
}