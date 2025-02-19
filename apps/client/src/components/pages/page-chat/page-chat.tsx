import { Component, h } from '@stencil/core';

@Component({
  tag: 'page-chat',
  styleUrl: 'page-chat.scss',
})
export class PageChat {
  render() {
    return (
      <ion-split-pane when="xs" content-id="chat-main">
        <ion-menu contentId="chat-main">
          <group-list></group-list>
        </ion-menu>
        <ion-nav id="chat-main"/>
      </ion-split-pane>
    );
  }
}
