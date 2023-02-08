import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
// import style from './espa-wifi-admin.scss';
import {EspaModule} from '../espa-module';
import {roundFormatter} from '../../utils/form/espa-form-bind.js';

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
          Temperature: ${parseFloat(this.__temperature).toFixed(2)} °C
        </div>
        <div>
          Humidity: ${parseFloat(this.__humidity).toFixed(2)} %
        </div>
      </espa-page-box>
      
      <espa-page-box>
        Configuration
        ${when(this.__sensorConfiguration, () => html`
          <espa-form .value="${this.__sensorConfiguration}">
            <espa-form-bind name="temperatureOffset" type="float" .formatter="${roundFormatter(2)}">
              <mwc-textfield label="Temperature Offset"></mwc-textfield>
            </espa-form-bind>
            <espa-form-bind name="humidityOffset" type="float" .formatter="${roundFormatter(2)}">
              <mwc-textfield label="Humidity Offset"></mwc-textfield>
            </espa-form-bind>
            <espa-form-submit
                slot="buttons"
                .submit="${this.__updateConfiguration}"
                success-message="Configuration updated"></espa-form-submit>
          </espa-form>
          
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

  async __updateConfiguration(value) {
    const res = await fetch('/api/dht/updateConfiguration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(value)
    });

    return await res.json();
  }
}