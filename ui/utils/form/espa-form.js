import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './espa-form-bind.js';
import './espa-form-submit.js';
import style from './espa-form.scss';

@customElement('espa-form')
export class EspaForm extends LitElement {
  static styles = style;

  @property({type: Object, attribute: false})
  value;

  __registeredElements = new Set();

  constructor() {
    super();

    this.addEventListener('espa-form-bind-connected', e => {
      const element = e.detail.element;
      if (!this.__registeredElements.has(element)) {
        this.__registeredElements.add(element);
        // Set element value
        const value = this.get(this.value, element.name);
        if (value !== undefined)
          element.setValue(value);
      }
    });

    this.addEventListener('espa-form-bind-disconnected', e => {
      const element = e.detail.element;
      if (this.__registeredElements.has(element)) {
        this.__registeredElements.delete(element);
      }
    });

    this.addEventListener('espa-form-bind-value-changed', e => {
      const element = e.detail.element;
      const newValue = {...this.value};
      this.set(newValue, element.name, e.detail.value);

      this.value = newValue;
    });

    this.addEventListener('espa-form-submit-connected', e => {
      e.detail.element.form = this;
    });
  }

  render() {
    return html`
      <div class="form">
        <slot></slot>
      </div>
      <div class="buttons">
        <slot name="buttons"></slot>
      </div>
    `;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('value')) {
      this.__registeredElements.forEach(element => {
        const value = this.get(this.value, element.name);
        element.setValue(value);
      });

      this.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
          value: this.value
        }
      }));
    }
  }

  get(root, path) {
    let prop = root;
    let parts = path.split('.');

    for (const part of parts) {
      if (!prop)
        return;

      prop = prop[part];
    }

    return prop;
  }

  set(root, path, value) {
    let prop = root;
    let parts = path.split('.');
    let last = parts[parts.length - 1];
    if (parts.length > 1) {
      // Loop over path parts[0..n-2] and dereference
      for (let i=0; i < parts.length - 1; i++) {
        let part = parts[i];
        prop = prop[part];
        if (!prop)
          return;
      }

      // Set value to object at end of path
      prop[last] = value;
    } else {
      // Simple property set
      prop[path] = value;
    }
  }
}