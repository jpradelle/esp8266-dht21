import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('espa-firmware')
export class EspaFirmware extends LitElement {
  render() {
    return html`
      <form id="update-firmware" method="POST" action="/api/admin/updateFirmware" enctype="multipart/form-data">
        <input type="file" name="update" required>
        <input type="submit" value="Update firmware">
      </form>
    `;
  }
}
