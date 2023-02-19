import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import style from './espa-logger.scss';

@customElement('espa-logger')
export class EspaLogger extends LitElement {
  static styles = [style];

  @state()
  __logs = [];

  constructor() {
    super();

    this.__init();
  }

  render() {
    return html`
      <pre>
        ${this.__logs}
      </pre>
    `;
  }

  async __init() {
    console.log('Trying to open a WebSocket connection...');
    const websocket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/wsApi/log`);
    websocket.onopen = (event) => {
      console.log('Connection opened');
    };
    websocket.onclose = (event) => {
      console.log('Connection closed');
      setTimeout(() => this.__init(), 2000);
    };
    websocket.onmessage = (event) => {
      console.log(event.data);
      this.__logs.push(event.data);
      this.requestUpdate();
    };
  }
}
