import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import style from './espa-expansion-group.scss';

@customElement('esp-expansion-group')
export class EspaExpansionGroup extends LitElement {
  static styles = [style];

  render() {
    // language=HTML
    return html`
      <slot></slot>
    `;
  }
}
