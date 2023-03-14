import {LitElement} from 'lit';

export class EspaNotification extends LitElement {
  static fire(source, message, type) {
    source.dispatchEvent(new CustomEvent('ui-notification', {
      bubbles: true,
      composed: true,
      detail: {
        type,
        message
      }
    }));
  }

  static success(source, message) {
    EspaNotification.fire(source, message, 'success')
  }

  static error(source, message) {
    EspaNotification.fire(source, message, 'error')
  }
}