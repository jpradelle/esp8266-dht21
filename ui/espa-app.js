import {html, LitElement} from 'lit';
import {customElement, state, queryAssignedElements} from 'lit/decorators.js';
import style from './espa-app.scss';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@material/mwc-snackbar';

@customElement('espa-app')
export class EspaApp extends LitElement {
  static styles = style;
  
  @state()
  __drawerOpened = false;

  /**
   * @type {EspaModule[]}
   */
  @queryAssignedElements()
  __slotContent;

  @state()
  __menuItems = [];

  @state()
  __route;

  @state()
  __routeData;

  __notifications = new Set();

  constructor() {
    super();

    this.addEventListener('ui-notification', e => {
      console.log(e, e.detail);
      this.__notifications.add(e.detail);
      this.requestUpdate();
    });
  }

  render() {
    return html`
      <app-location @route-changed="${this.__routeChanged}" use-hash-as-path></app-location>
      <app-route
          .route="${this.__route}"
          pattern="/:module"
          @route-data-changed="${this.__routeDataChanged}"
          @tail-changed="${this.__routeDataChanged}"></app-route>
      
      <mwc-drawer hasHeader type="modal" ?open="${this.__drawerOpened}" @MDCDrawer:closed="${this.__closeDrawer}">
        ${this.__menuItems.map(menuItem => html`
          <a class="menu-item" href="#/${menuItem.routePath}" @click="${this.__closeDrawer}">
            <mwc-icon-button icon="${menuItem.icon}"></mwc-icon-button>
            ${menuItem.name}
          </a>
        `)}
        <div slot="appContent">
          <mwc-top-app-bar-fixed>
            <mwc-icon-button icon="menu" slot="navigationIcon" @click="${this.__openDrawer}"></mwc-icon-button>
            <div slot="title">ESP Temperature and Humidity</div>
            <div class="app-content">
              <slot @slotchange="${this.__slotChanged}"></slot>
            </div>
          </mwc-top-app-bar-fixed>
        </div>
      </mwc-drawer>

      ${Array.from(this.__notifications.values()).map(notif => html`
        <mwc-snackbar
            labelText="${notif.message}"
            open
            class="notification ${notif.type}"
            @MDCSnackbar:closed="${() => this.__notificationClosed(notif)}">
          <mwc-icon-button icon="close" slot="dismiss"></mwc-icon-button>
        </mwc-snackbar>
      `)}
    `;
  }

  __slotChanged() {
    this.__menuItems = this.__slotContent.map(item => ({
      routePath: item.getRoutePath(),
      icon: item.getIcon(),
      name: item.getName()
    }));
    this.__updateRoute();
  }

  __updateRoute() {
    this.__slotContent.forEach(item => {
      item.displayed = this.__routeData.data.module === item.getRoutePath();
      if (item.displayed) {
        item.subRoute = this.__routeData.tail;
      }
    });
  }

  __openDrawer() {
    this.__drawerOpened = true;
  }

  __closeDrawer() {
    this.__drawerOpened = false;
  }

  __routeChanged(e) {
    this.__route = {...e.target.route};
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('__routeData')) {
      this.__updateRoute();
    }
  }

  __routeDataChanged(e) {
    this.__routeData = {
      data: {...e.target.data},
      tail: {...e.target.tail}
    };
  }

  __notificationClosed(notif) {
    this.__notifications.delete(notif);
    this.requestUpdate();
  }
}