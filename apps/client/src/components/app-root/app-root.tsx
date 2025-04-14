import { Component, ComponentInterface, h, State } from '@stencil/core';
import { IsLoggedInGuard } from '../../guards/IsLoggedInGuard';
import { AccountService } from '../../features/account/account.service';
import { ReplicationModule } from '../../features/replication/replication.module';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss',
})
export class AppRoot implements ComponentInterface {
  @State() isLoggedIn: boolean = false;
  @State() messages: any[] = [];
  private accountService: AccountService = AccountService.getInstance();
  private replicationSocketService = ReplicationModule.getInstance().getReplicationSocketService();
  componentWillLoad(){
    this.accountService.isLoggedIn().subscribe((isLoggedIn) => {
      console.log('Logged in:', isLoggedIn);
      this.isLoggedIn = isLoggedIn;
      if(this.isLoggedIn) {
        this.replicationSocketService?.updateAuthToken(this.accountService.getToken() as string)
        console.log("token",this.accountService.getToken() as string);
        this.replicationSocketService?.startReplicationPolling();
      }else{
        this.replicationSocketService?.stopReplicationPolling();
      }
    });
  }

  render() {
    return [
      <ion-app>
        <ion-router useHash={false}>
          <ion-route url="/login" component="page-login" />
          <ion-route url="/register" component="page-register" />
          <ion-route url="/chat" component="page-chat" beforeEnter={IsLoggedInGuard}>
            <ion-route component="chat-default" beforeEnter={IsLoggedInGuard} />
            <ion-route url="view/:groupId" component="chat-view" beforeEnter={IsLoggedInGuard}/>
          </ion-route>
          {!this.isLoggedIn &&  <ion-route-redirect from="/" to="/login" />}
          {this.isLoggedIn &&  <ion-route-redirect from="/" to="/chat" />}
        </ion-router>
        <ion-nav />
      </ion-app>,
    ];
  }
}
