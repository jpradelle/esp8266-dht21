import {LitElement, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import style from './espa-collapse.scss';

@customElement('espa-collapse')
export class EspaCollapse extends LitElement {
  static styles = [style];

  @property({type: Boolean, reflect: true})
  opened = false;

  @query('#container')
  __container;

  render() {
    return html`
      <div id="container" style="overflow: hidden; max-height: 0;">
        <slot></slot>
      </div>
    `;
  }

  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);

    if (changedProperties.has('opened')) {
      if (this.__container) {
        const containerHeight = this.__container.scrollHeight;
        this.__setMaxHeight(containerHeight);
        const animationTime = this.__computeAnimationTime(containerHeight);
        this.__toggleOverflow(true);

        setTimeout(() => {
          if (this.__timeout)
            clearTimeout(this.__timeout);

          if (!this.opened) {
            this.__setMaxHeight(0);
          } else {
            this.__timeout = setTimeout(() => {
              this.__setMaxHeight(null);
              this.__toggleOverflow(false);
            }, animationTime * 1000);
          }
        }, 0);
      } else {
        setTimeout(() => {
          if (!this.opened) {
            this.__setMaxHeight(0);
            this.__toggleOverflow(true);
          } else {
            this.__setMaxHeight(null);
            this.__toggleOverflow(false);
          }
        }, 0);
      }
    }
  }

  __setMaxHeight(height) {
    if (this.__container)
      this.__container.style['max-height'] = height !== null ? `${height}px` : null;
  }

  __toggleOverflow(hidden) {
    if (this.__container) {
      this.__container.style.overflow = hidden ? 'hidden' : null;
    }
  }

  __computeAnimationTime(containerHeight) {
    const time = Math.min(Math.max(containerHeight / 1500, 0.15), 0.6);
    this.style.setProperty('--espa-collapse-animation-time', `${time}s`);

    return time;
  }

  toggle() {
    this.opened = !this.opened;
  }

  show() {
    this.opened = true;
  }

  hide() {
    this.opened = false;
  }
}
