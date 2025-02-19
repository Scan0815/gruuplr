import { Component, ComponentInterface, h } from '@stencil/core';

@Component({
  tag: 'chat-default',
  styleUrl: 'chat-default.scss',
})
export class ChatDefault implements ComponentInterface {
  render() {
    return (
      <ion-content class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Welcome to Gruuplr Chat!</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            Please select a group from the menu to start chatting.
          </ion-card-content>
        </ion-card>
      </ion-content>
    );
  }
}
