import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
// import style from './espa-wifi-admin.scss';
import {EspaModule} from '../espa-module';
import './espa-device-configuration.js';

@customElement('espa-device')
export class EspaDevice extends EspaModule(LitElement) {
  // static styles = style;

  render() {
    if (!this.displayed)
      return '';

    return html`
      <espa-device-configuration></espa-device-configuration>
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