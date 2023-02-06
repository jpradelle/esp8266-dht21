import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
// import style from './espa-wifi-admin.scss';
import {EspaModule} from '../espa-module';

@customElement('espa-dht')
class EspaWifiAdmin extends EspaModule(LitElement) {
  // static styles = style;

  @state()
  __temperature = null;

  @state()
  __humidity = null;

  @state()
  __sensorConfiguration = null;

  constructor() {
    super();

    this.__apiCall();
    this.__loadConfiguration();
    setInterval(() => {
      this.__apiCall();
    }, 6000);
  }

  render() {
    if (!this.displayed)
      return '';

    return html`
      <espa-page-box>
        <div>
          Temperature: ${this.__temperature} °C
        </div>
        <div>
          Humidity: ${this.__humidity} %
        </div>
      </espa-page-box>
      
      <espa-page-box>
        Configuration
        ${when(this.__sensorConfiguration, () => html`
          <div>
            Temperature: ${this.__sensorConfiguration.temperatureOffset} °C
          </div>
          <div>
            Humidity: ${this.__sensorConfiguration.humidityOffset} %
          </div>
          <mwc-button @click="${this.__updateConfiguration}">Update configuration</mwc-button>
        `, () => html`
          <div>
            Loading
          </div>
        `)}
      </espa-page-box>
    `;
  }

  getIcon() {
    return 'thermostat';
  }

  getName() {
    return 'DHT sensor';
  }

  getRoutePath() {
    return 'dht-sensor';
  }

  async __apiCall() {
    const res = await fetch('/api/dht/sensorData');
    const json = await res.json();
    this.__temperature = json.temperature;
    this.__humidity = json.humidity;
  }

  async __loadConfiguration() {
    const res = await fetch('/api/dht/getConfiguration');
    this.__sensorConfiguration = await res.json();
  }

  __updateConfiguration() {
    fetch('/api/dht/updateConfiguration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({temperatureOffset: -0.75, humidityOffset: -0.75})
    });
  }
}