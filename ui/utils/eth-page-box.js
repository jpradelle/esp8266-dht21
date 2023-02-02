import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import style from './eth-page-box.scss';

@customElement('eth-page-box')
class EthPageBox extends LitElement {
  static styles = style;

  render() {
    return html`
      <div class="mdc-elevation--2 box">
        <slot></slot>
      </div>
    `;
  }
}