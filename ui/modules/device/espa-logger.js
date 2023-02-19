import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import style from './espa-logger.scss';

@customElement('espa-logger')
export class EspaLogger extends LitElement {
  static styles = [style];

  @state()
  __logs = [];

  @state()
  __autoScroll = true;

  constructor() {
    super();

    this.__init();
  }

  render() {
    this.updateComplete.then(() => this.__updateScroll());
    return html`
      <espa-checkbox ?value="${this.__autoScroll}" @change="${this.__autoScrollChange}" label="Auto scroll"></espa-checkbox>
      <pre id="logs">${this.__logs}</pre>
    `;
  }

  async __init() {
    this.__logs.push('[UI] Trying to open a WebSocket connection...\n');
    this.requestUpdate();

    const websocket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/wsApi/log`);
    websocket.onopen = (event) => {
      this.__logs.push('[UI] Connection opened\n');
      this.requestUpdate();
    };
    websocket.onclose = (event) => {
      this.__logs.push('[UI] Connection closed\n');
      this.requestUpdate();
      setTimeout(() => this.__init(), 2000);
    };
    websocket.onmessage = (event) => {
      this.__logs.push(event.data);
      this.requestUpdate();
    };
  }

  __autoScrollChange(e) {
    this.__autoScroll = e.target.value;
  }

  __updateScroll() {
    if (this.__autoScroll) {
      const logs = this.shadowRoot.querySelector('#logs');
      logs.scrollTop = logs.scrollHeight;
    }
  }
}
