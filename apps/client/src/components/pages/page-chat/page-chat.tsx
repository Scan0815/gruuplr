import { Component, ComponentInterface, h, State } from '@stencil/core';
import { ChatSocketService } from '../../../services/chat-socket.service';
import { AccountService } from '../../../services/account.service';
import { RouterNavigate } from '../../../utilities/RouterNavigate';

@Component({
  tag: 'page-chat',
  styleUrl: 'page-chat.scss',
})
export class PageChat implements ComponentInterface {
  @State() messages: any[] = [];
  private accountService: AccountService = AccountService.getInstance();
  private chatSocketService: ChatSocketService|null = null;

  async componentWillLoad() {
    this.chatSocketService = ChatSocketService.getInstance(this.accountService.getToken() as string);
    const groupIds = ['random', 'general', 'support'];
    // Listen for incoming messages from all joined groups
    this.chatSocketService.onMessage((message) => {
      this.messages = [...this.messages, message];
      console.log('New message:', message);
    });


    this.accountService.isLoggedIn$().subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.chatSocketService = ChatSocketService.getInstance(this.accountService.getToken() as string);
        this.chatSocketService.joinGroups(groupIds);
      }else{
        this.chatSocketService?.disconnect();
      }
    });


    this.chatSocketService.onErrorMessage(async (message) => {
      console.error('Error:', message);
      switch (message.code) {
        case 'TOKEN_INVALID':
          console.error('Token invalid');
          this.accountService?.clearToken();
          await RouterNavigate('/login','back');
          break;
      }
    });

  }

  render() {
    return (
      <ion-split-pane when="xs" content-id="chat-main">
        <ion-menu contentId="chat-main">
          <group-list></group-list>
        </ion-menu>
        <ion-nav id="chat-main" />
      </ion-split-pane>
    );
  }
}
