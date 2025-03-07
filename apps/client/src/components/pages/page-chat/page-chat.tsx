import { Component, ComponentInterface, h, State } from '@stencil/core';
import { ChatSocketService } from '../../../services/chat-socket.service';
import { AccountService } from '../../../services/account.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  tag: 'page-chat',
  styleUrl: 'page-chat.scss',
})
export class PageChat implements ComponentInterface {
  @State() messages: any[] = [];
  private accountService: AccountService = AccountService.getInstance();
  //private authService:AuthService = AuthService.getInstance();
  private chatSocketService: ChatSocketService|null = null;
  async componentWillLoad() {
    this.chatSocketService = ChatSocketService.getInstance(this.accountService.getToken() as string);
    // Listen for incoming messages from all joined groups
    this.chatSocketService.onMessage((message) => {
      this.messages = [...this.messages, message];
      console.log('New message:', message);
    });


    this.accountService.isLoggedIn$().subscribe(async (isLoggedIn) => {

      console.log('PageChat isLoggedIn:', isLoggedIn);

      if (isLoggedIn) {
        //const groups = await GroupService.getInstance().getMyGroups();
        //const groupIds = groups.map((group) => group.id);
        //this.chatSocketService?.joinGroups(groupIds);
      }else{
        this.chatSocketService?.disconnect();
      }
    });

    this.chatSocketService.onErrorMessage(async (message) => {
      console.error('Socket error:', message);
      switch (message.code) {
        case 'TOKEN_INVALID':
          await AuthService.getInstance().refreshAccessToken();
          break;
        default:
          // Handle other error codes if needed.
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
