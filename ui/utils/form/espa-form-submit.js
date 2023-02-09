import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {EspaNotification} from '../espa-notification.js';

@customElement('espa-form-submit')
export class EspaFormSubmit extends LitElement {
  @property({type: Function, attribute: false})
  submit;

  @property({attribute: 'success-message'})
  successMessage;

  form;

  @state()
  __submitting = false;

  connectedCallback() {
    super.connectedCallback();

    this.dispatchEvent(new CustomEvent('espa-form-submit-connected', {
      bubbles: true,
      composed: true,
      detail: {
        element: this
      }
    }));
  }

  render() {
    return html`
      <mwc-button @click="${this.__submitClicked}" ?disabled="${this.__submitting}" unelevated>Save</mwc-button>
    `;
  }

  async __submitClicked() {
    this.__submitting = true;
    try {
      const res = await this.submit(this.form.value);
      if (res.success) {
        EspaNotification.success(this, this.successMessage);
      } else {
        console.log('fail')
      }
    } catch (e) {
      console.log('fail', e)
    }

    this.__submitting = false;

  }
}