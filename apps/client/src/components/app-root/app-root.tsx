import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss'
})
export class AppRoot {
  render() {
    return [
       <ion-app>
        <ion-router useHash={false}>
          <ion-route url="/rxdb-test/:userId" component="rxdb-test" />
        </ion-router>
        <ion-nav />
       </ion-app>
    ];
  }
}
