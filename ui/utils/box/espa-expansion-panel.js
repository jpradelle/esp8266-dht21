import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import style from './espa-expansion-panel.scss';
import {classMap} from 'lit/directives/class-map.js';
import './espa-collapse.js';

@customElement('espa-expansion-panel')
export class EspaExpansionPanel extends LitElement {
  static styles = [style];

  /**
   * Title to display when expansion-panel is collapsed
   * @type {string}
   */
  @property()
  heading;

  /**
   * Open expansion panel.
   * @type {boolean}
   */
  @property({type: Boolean, reflect: true})
  opened = false;

  render() {
    const cls = classMap({
      opened: this.opened,
      closed: !this.opened
    });

    return html`
      <div class="content-margin-collapse">
        <div class="panel-top" tabindex="1" @click="${this.__panelTopClicked}">
          <div class="title-content">
            <slot name="title"><span class="panel-title">${this.heading}</span></slot>
          </div>
          <mwc-icon class="icon ${cls}">expand_more</mwc-icon>
        </div>
        <espa-collapse ?opened="${this.opened}">
          <div class="panel-content">
            <slot></slot>
          </div>
        </espa-collapse>
      </div>
    `;
  }

  __panelTopClicked(e) {
    this.opened = !this.opened;
    e.currentTarget.blur();
  }
}
