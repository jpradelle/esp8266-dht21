import {html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import style from './espa-page-box.scss';

@customElement('espa-page-box')
class EspaPageBox extends LitElement {
  static styles = style;

  render() {
    return html`
      <div class="mdc-elevation--2 box">
        <slot></slot>
      </div>
    `;
  }
}