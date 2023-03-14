import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {guard} from 'lit/directives/guard.js';
import globalStyle from '../../espa-global.scss';
import {EspaModule} from '../espa-module';
import {roundFormatter} from '../../utils/form/espa-form-bind.js';

@customElement('espa-dht')
export class EspaWifiAdmin extends EspaModule(LitElement) {
  static styles = [globalStyle];

  @state()
  __temperature = null;

  @state()
  __humidity = null;

  @state()
  __sensorConfiguration = null;

  constructor() {
    super();

    this.__readSensorData();
    this.__loadConfiguration();
    setInterval(() => {
      this.__readSensorData();
    }, 15000);
  }

  render() {
    if (!this.displayed)
      return '';

    return html`
      <esp-expansion-group>
        <espa-expansion-panel heading="Sensor data" opened>
          <div>
            Temperature: ${parseFloat(this.__temperature).toFixed(2)} °C
          </div>
          <div>
            Humidity: ${parseFloat(this.__humidity).toFixed(2)} %
          </div>
        </espa-expansion-panel>

        <espa-expansion-panel heading="Sensor configuration">
          ${when(this.__sensorConfiguration, () => html`
            <espa-form .value="${this.__sensorConfiguration}" @value-changed="${this.__formValueChanged}">
              <div class="line">
                <espa-form-bind name="temperatureOffset" type="float" .formatter="${roundFormatter(2)}">
                  <mwc-textfield label="Temperature Offset"></mwc-textfield>
                </espa-form-bind>
                <espa-form-bind name="humidityOffset" type="float" .formatter="${roundFormatter(2)}">
                  <mwc-textfield label="Humidity Offset"></mwc-textfield>
                </espa-form-bind>
              </div>
              
              <div class="line">
                <espa-form-bind name="mqttEnabled">
                  <espa-checkbox label="Enable MQTT"></espa-checkbox>
                </espa-form-bind>
              </div>
              <div class="line">
                <espa-form-bind name="mqttAddress">
                  <mwc-textfield label="MQTT Address" ?disabled="${!this.__sensorConfiguration.mqttEnabled}" required></mwc-textfield>
                </espa-form-bind>
                <espa-form-bind name="mqttPort" type="int">
                  <mwc-textfield
                      label="MQTT Port"
                      ?disabled="${!this.__sensorConfiguration.mqttEnabled}"
                      required
                      type="number"></mwc-textfield>
                </espa-form-bind>
                <espa-form-bind name="mqttUser">
                  <mwc-textfield label="MQTT User" ?disabled="${!this.__sensorConfiguration.mqttEnabled}"></mwc-textfield>
                </espa-form-bind>
                <espa-form-bind name="mqttPassword">
                  <mwc-textfield label="MQTT Password" ?disabled="${!this.__sensorConfiguration.mqttEnabled}"></mwc-textfield>
                </espa-form-bind>
              </div>
              <div class="line">
                <espa-form-bind name="mqttClientId">
                  <mwc-textfield label="MQTT Client ID" ?disabled="${!this.__sensorConfiguration.mqttEnabled}" required></mwc-textfield>
                </espa-form-bind>
                <espa-form-bind name="mqttTopic">
                  <mwc-textfield label="MQTT Topic" ?disabled="${!this.__sensorConfiguration.mqttEnabled}" required></mwc-textfield>
                </espa-form-bind>
              </div>
              
              ${JSON.stringify(this.__sensorConfiguration)}
              
              <espa-form-submit
                  slot="buttons"
                  .submit="${this.__updateConfiguration}"
                  success-message="Configuration updated"></espa-form-submit>
            </espa-form>
          `, () => html`
            <div>
              Loading
            </div>
          `)}
        </espa-expansion-panel>
      </esp-expansion-group>
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

  async __readSensorData() {
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

  __formValueChanged(e) {
    this.__sensorConfiguration = e.detail.value;
  }
}