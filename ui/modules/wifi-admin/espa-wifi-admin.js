import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
// import style from './espa-wifi-admin.scss';
import {EspaModule} from '../espa-module';

@customElement('espa-wifi-admin')
class EspaWifiAdmin extends EspaModule(LitElement) {
  // static styles = style;

  render() {
    if (!this.displayed)
      return '';

    return html`
      <espa-page-box>
        Wifi admin
      </espa-page-box>
    `;
  }

  getIcon() {
    return 'wifi'
  }

  getName() {
    return 'Wifi admin'
  }

  getRoutePath() {
    return 'wifi-admin'
  }
}