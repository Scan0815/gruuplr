import { Component, ComponentInterface, h, State } from '@stencil/core';
import { IsLoggedInGuard } from '../../guards/IsLoggedInGuard';
import { AccountService } from '../../services/account.service';
import { ChatSocketService } from '../../services/chat-socket.service';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss',
})
export class AppRoot implements ComponentInterface {
  @State() isLoggedIn: boolean = false;
  @State() messages: any[] = [];
  private accountService: AccountService = AccountService.getInstance();
  private chatSocketService: ChatSocketService|null = null;

  componentWillLoad(){
    this.accountService.isLoggedIn$().subscribe((isLoggedIn) => {
      console.log('Logged in:', isLoggedIn);
      this.isLoggedIn = isLoggedIn;
      if(this.isLoggedIn) {
        console.log("token",this.accountService.getToken() as string);
        this.chatSocketService = ChatSocketService.getInstance(this.accountService.getToken() as string);
      }else if(this.chatSocketService){
        this.chatSocketService.disconnect();
      }
    });
  }

  render() {
    return [
      <ion-app>
        <ion-router useHash={false}>
          <ion-route url="/login" component="page-login" />
          <ion-route url="/register" component="page-register" />
          <ion-route
            url="/chat"
            component="page-chat"
            beforeEnter={IsLoggedInGuard}>
            <ion-route component="chat-default" />
            <ion-route url="view/:groupId" component="chat-view" />
          </ion-route>
          {!this.isLoggedIn &&  <ion-route-redirect from="/" to="/login" />}
          {this.isLoggedIn &&  <ion-route-redirect from="/" to="/chat" />}
        </ion-router>
        <ion-nav />
      </ion-app>,
    ];
  }
}
