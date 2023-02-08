import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import style from './espa-page-box.scss';
import {when} from 'lit/directives/when.js';

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