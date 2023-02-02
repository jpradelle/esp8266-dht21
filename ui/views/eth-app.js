import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import style from './eth-app.scss';

@customElement('eth-app')
class EthApp extends LitElement {
  static styles = style;

  @property({type: Number})
  count = 0;
  
  @state()
  __drawerOpened = false;

  clickHandler() {
    this.count++;
  }

  render() {
    return html`
      <mwc-drawer hasHeader type="modal" ?open="${this.__drawerOpened}" @MDCDrawer:closed="${this.__closeDrawer}">
        <div>
          <p>Drawer content!</p>
          <mwc-icon-button icon="gesture"></mwc-icon-button>
          <mwc-icon-button icon="gavel"></mwc-icon-button>
        </div>
        <div slot="appContent">
          <mwc-top-app-bar-fixed>
            <mwc-icon-button icon="menu" slot="navigationIcon" @click="${this.__openDrawer}"></mwc-icon-button>
            <div slot="title">ESP Temperature and Humidity</div>
            <div class="app-content">
              <eth-page-box>
                <p>The count is: ${this.count}</p>
                <button @click="${(this.clickHandler)}">Click</button>
              </eth-page-box>
            </div>
          </mwc-top-app-bar-fixed>
        </div>
      </mwc-drawer>
    `;
  }

  __openDrawer() {
    this.__drawerOpened = true;
  }

  __closeDrawer() {
    this.__drawerOpened = false;
  }
}