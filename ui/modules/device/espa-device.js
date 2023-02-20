import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
// import style from './espa-wifi-admin.scss';
import {EspaModule} from '../espa-module';
import './espa-device-configuration.js';
import './espa-file-system.js';
import './espa-logger.js';
import './espa-firmware.js';

@customElement('espa-device')
export class EspaDevice extends EspaModule(LitElement) {
  // static styles = style;

  render() {
    if (!this.displayed)
      return '';

    return html`
      <esp-expansion-group>
        <espa-expansion-panel heading="System configuration">
          <espa-device-configuration></espa-device-configuration>
        </espa-expansion-panel>
        <espa-expansion-panel heading="File system">
          <espa-file-system></espa-file-system>
        </espa-expansion-panel>
        <espa-expansion-panel heading="Logs">
          <espa-logger></espa-logger>
        </espa-expansion-panel>
        <espa-expansion-panel heading="Firmware">
          <espa-firmware></espa-firmware>
        </espa-expansion-panel>
      </esp-expansion-group>
    `;
  }

  getIcon() {
    return 'hardware';
  }

  getName() {
    return 'Device';
  }

  getRoutePath() {
    return 'device';
  }
}