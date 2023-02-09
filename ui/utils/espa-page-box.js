import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import style from './espa-page-box.scss';
import {when} from 'lit/directives/when.js';

@customElement('espa-page-box')
export class EspaPageBox extends LitElement {
  static styles = style;

  @property()
  heading;

  render() {
    return html`
      <div class="mdc-elevation--2 box">
        ${when(this.heading, () => html`
          <h3 class="title">${this.heading}</h3>
        `)}
        <slot></slot>
      </div>
    `;
  }
}