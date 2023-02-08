import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import style from './espa-page-box.scss';
import {when} from 'lit/directives/when.js';

@customElement('espa-page-box')
class EspaPageBox extends LitElement {
  static styles = style;

  @property()
  title;

  render() {
    return html`
      <div class="mdc-elevation--2 box">
        ${when(this.title, () => html`
          <h3 class="title">${this.title}</h3>
        `)}
        <slot></slot>
      </div>
    `;
  }
}