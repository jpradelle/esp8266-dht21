import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@material/mwc-checkbox';
import '@material/mwc-formfield';

@customElement('espa-checkbox')
export class EspaCheckbox extends LitElement {
  // static styles = style;

  @property()
  label;

  @property({type: Boolean})
  value;

  render() {
    return html`
      <mwc-formfield label="${this.label}">
        <mwc-checkbox ?checked="${this.value}" @change="${this.__changed}"></mwc-checkbox>
      </mwc-formfield>
    `;
  }

  __changed(e) {
    this.value = e.target.checked;
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: false,
      composed: true,
      detail: {
        value: this.value
      }
    }));
  }
}