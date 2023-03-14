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
      <div class="content-margin-collapse">
        <div class="box">
          ${when(this.heading, () => html`
            <div class="title">${this.heading}</div>
          `)}
          <div class="content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}