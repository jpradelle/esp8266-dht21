import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
// import style from './espa-wifi-admin.scss';
import {EspaModule} from '../espa-module';

@customElement('espa-info')
class EspaWifiAdmin extends EspaModule(LitElement) {
  // static styles = style;

  render() {
    if (!this.displayed)
      return '';

    return html`
      <espa-page-box>
        Info page
      </espa-page-box>
    `;
  }

  getIcon() {
    return 'info';
  }

  getName() {
    return 'Info';
  }

  getRoutePath() {
    return 'info';
  }
}