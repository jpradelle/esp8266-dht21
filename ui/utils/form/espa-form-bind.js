import {html, LitElement} from 'lit';
import {customElement, property, queryAssignedElements} from 'lit/decorators.js';
import style from './espa-form-bind.scss';

export const roundFormatter = decimal => value => parseFloat(value).toFixed(decimal);

@customElement('espa-form-bind')
export class EspaFormBind extends LitElement {
  static styles = [style];

  @property()
  name;

  @queryAssignedElements()
  slotContent;

  element;

  value;

  /**
   * Value type
   * @type {(string|int|float)}
   */
  @property()
  type;

  @property({type: Function, attribute: false})
  formatter;

  __valueChangedListener = e => {
    if (this.type === 'int') {
      this.value = parseInt(this.element.value, 10);
    } else if (this.type === 'float') {
      this.value = parseFloat(this.element.value);
    } else {
      this.value = this.element.value;
    }
    this.dispatchEvent(new CustomEvent('espa-form-bind-value-changed', {
      bubbles: true,
      composed: true,
      detail: {
        element: this,
        value: this.value
      }
    }));
  }

  connectedCallback() {
    super.connectedCallback();

    this.dispatchEvent(new CustomEvent('espa-form-bind-connected', {
      bubbles: true,
      composed: true,
      detail: {
        element: this
      }
    }));
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.dispatchEvent(new CustomEvent('espa-form-bind-disconnected', {
      bubbles: true,
      composed: true,
      detail: {
        element: this
      }
    }));
  }

  render() {
    return html`
      <slot @slotchange="${this.__slotChanged}"></slot>
    `;
  }

  setValue(value) {
    this.value = value;
    if (this.element) {
      this.element.value = this.formatter ? this.formatter(value) : value;
    }
  }

  __slotChanged() {
    if (this.element)
      this.element.removeEventListener('change', this.__valueChangedListener);

    if (this.slotContent.length > 0) {
      this.element = this.slotContent[0];
      this.element.addEventListener('change', this.__valueChangedListener);
      if (this.value !== undefined)
        this.setValue(this.value);
    } else {
      this.element = null;
    }
  }

  reportValidity() {
    if (this.element.reportValidity)
      return this.element.reportValidity();

    return true;
  }
}