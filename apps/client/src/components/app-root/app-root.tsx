import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss'
})
export class AppRoot {
  render() {
    return [
        <ion-header>
          <ion-toolbar>
            <ion-title>Stencil App Starter</ion-title>
          </ion-toolbar>
        </ion-header>,
        <ion-content>
          <ion-list>
            <ion-item>
              <ion-icon aria-hidden="true" name="airplane" slot="start"></ion-icon>
              <ion-label>Airplane Mode</ion-label>
            </ion-item>
            <ion-item>
              <ion-icon aria-hidden="true" name="airplane" slot="start"></ion-icon>
              <ion-label>Airplane Mode</ion-label>
            </ion-item>
            <ion-item>
              <ion-icon aria-hidden="true" name="airplane" slot="start"></ion-icon>
              <ion-label>Airplane Mode</ion-label>
            </ion-item>
            <ion-item>
              <ion-icon aria-hidden="true" name="airplane" slot="start"></ion-icon>
              <ion-label>Airplane Mode</ion-label>
            </ion-item>
            <ion-item>
              <ion-icon aria-hidden="true" name="airplane" slot="start"></ion-icon>
              <ion-label>Airplane Mode</ion-label>
            </ion-item>
            <ion-item>
              <ion-icon aria-hidden="true" name="airplane" slot="start"></ion-icon>
              <ion-label>Airplane Mode</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
    ];
  }
}
