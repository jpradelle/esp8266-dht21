import {LitElement, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import style from './espa-file-system.scss';
import {EspaNotification} from '../../utils/espa-notification.js';

@customElement('espa-file-system')
export class EspaFileSystem extends LitElement {
  static styles = [style];

  @state()
  __fileSystemInfo = null;

  constructor() {
    super();

    this.__loadFileSystemInfo();
  }

  render() {
    return html`
      ${when(this.__fileSystemInfo, () => html`
        <div class="info">
          File system size: <span class="bold">${this.__humanFileSize(this.__fileSystemInfo.totalSize)}</span><br/>
          Used space <span class="bold">${this.__humanFileSize(this.__fileSystemInfo.totalSize - this.__fileSystemInfo.freeSpace)}</span><br/>
          Free space <span class="bold">${this.__humanFileSize(this.__fileSystemInfo.freeSpace)}</span>
        </div>
        <div class="content">
          <div class="title">Files</div>
          <div class="file-content">
            <div class="file-upload">
              <input type="file" name="file" @change="${this.__fileSelected}"/>
              <mwc-textfield label="Target path" name="targetPath"></mwc-textfield>
              <mwc-button outlined @click="${this.__uploadFile}">Upload file</mwc-button>
            </div>
            
            ${this.__fileSystemInfo.files.map(file => html`
              <div class="file-row">
                <a href="/api/admin/getFile?file=${file}">${file}</a>
                <mwc-icon-button icon="delete" class="icon delete" @click="${() => this.__deleteFile(file)}"></mwc-icon-button>
              </div>
            `)}
          </div>
        </div>
      `, () => html`
        Loading
      `)}
    `;
  }

  async __loadFileSystemInfo() {
    this.__fileSystemInfo = null;
    const res = await fetch('/api/admin/getFileSystemInfo');
    this.__fileSystemInfo = await res.json();
  }

  __humanFileSize(size) {
    let i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
  }

  async __deleteFile(file) {
    if (window.confirm('Are you sure to delete file ' + file + ' ?')) {
      const res = await fetch('/api/admin/deleteFile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({file})
      });

      const successRes = await res.json();

      if (successRes.success) {
        EspaNotification.success(this, 'File ' + file + ' deleted');
      } else {
        EspaNotification.error(this, 'Fail to delete file ' + file);
      }
      this.__loadFileSystemInfo();
    }
  }

  __fileSelected() {
    const input = this.shadowRoot.querySelector('input[name=file]');
    if (input.files.length === 1) {
      this.shadowRoot.querySelector('[name=targetPath]').value = '/' + input.files[0].name;
    }

  }

  async __uploadFile() {
    const input = this.shadowRoot.querySelector('input[name=file]');
    const finalName = this.shadowRoot.querySelector('[name=targetPath]').value;

    if (input.files.length === 0) {
      EspaNotification.error(this, 'Please choose a file to upload');
    } else if (finalName === '' || finalName === undefined || finalName === null) {
      EspaNotification.error(this, 'Please fill in target path');
    } else {
      const formData = new FormData();
      formData.set('file', input.files[0], finalName);

      const res = await fetch('/api/admin/uploadFile', {
        method: 'POST',
        body: formData
      });
      const successRes = await res.json();
      if (successRes.success) {
        EspaNotification.success(this, 'File  uploaded');
      } else {
        EspaNotification.error(this, 'Fail to upload file');
      }
      this.__loadFileSystemInfo();
    }
  }
}
