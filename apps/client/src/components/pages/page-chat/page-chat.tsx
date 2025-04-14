import { Component, ComponentInterface, h, State } from '@stencil/core';
import { AccountService } from '../../../features/account/account.service';
import { ReplicationModule } from '../../../features/replication/replication.module';

@Component({
  tag: 'page-chat',
  styleUrl: 'page-chat.scss',
})
export class PageChat implements ComponentInterface {
  @State() messages: any[] = [];
  private accountService: AccountService = AccountService.getInstance();
  //private authService:AuthService = AuthService.getInstance();
  private replicationSocketService = ReplicationModule.getInstance().getReplicationSocketService();
  async componentWillLoad() {
    this.accountService.isLoggedIn().subscribe(async (isLoggedIn) => {
      console.log('PageChat isLoggedIn:', isLoggedIn);
      if(isLoggedIn){
        try{
          const lastReplicationRequest = localStorage.getItem('lastReplicationRequest');
          const lastReplicationRequestTimestamp = lastReplicationRequest ? parseInt(lastReplicationRequest) : 0;
          this.replicationSocketService?.updateAuthToken(this.accountService.getToken() as string);
          const records = await this.replicationSocketService.requestReplicationSince(lastReplicationRequestTimestamp);
          if(records){
            await this.replicationSocketService.handleBulkReplication(records);
          }
          localStorage.setItem('lastReplicationRequest', Date.now().toString());
        }catch(error){
          console.error('Failed to request replication data:', error);
        }
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
