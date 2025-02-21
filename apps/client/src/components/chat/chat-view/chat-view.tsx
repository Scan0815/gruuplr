import { Component, h, Prop, State, Watch } from '@stencil/core';
import { RxDBService } from '../../../services/rxdb.service';
import { ChatSocketService } from '../../../services/chat-socket.service';
import { AccountService } from '../../../services/account.service';

@Component({
  tag: 'chat-view',
  styleUrl: 'chat-view.scss',
})
export class ChatView {
  @Prop() groupId!: string;
  @State() messages: any[] = [];
  @State() newMessage: string = '';

  private socketService: ChatSocketService = ChatSocketService.getInstance(AccountService.getInstance().getToken() as string);

  private rxdbService: RxDBService = new RxDBService();

  async componentDidLoad() {
    await this.rxdbService.initialize();
    if (this.groupId) {
      await this.loadMessages();
    }
  }

  @Watch('groupId')
  async onGroupIdChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      await this.loadMessages();
    }
  }

  async loadMessages() {
    if (this.groupId) {
      this.messages = await this.rxdbService.getMessages(this.groupId);
      this.messages = this.messages.sort((a, b) => a.updatedAt - b.updatedAt);
    }
  }

  async sendMessage(event: Event) {
    event.preventDefault();
    if (!this.newMessage || !this.groupId) return;
    const userId = AccountService.getInstance().getUser()?.id || '1';
    await this.rxdbService.addMessage(this.newMessage, userId, this.groupId);
    this.socketService.sendMessage({
      groupId:this.groupId,
      userId:userId,
      encryptedMessage:this.newMessage,
      keyId: '1'
    });
    this.newMessage = '';
    await this.loadMessages();
  }

  render() {
    return [
        <ion-header>
          <ion-toolbar>
            <ion-title>Chat - {this.groupId}</ion-title>
          </ion-toolbar>
        </ion-header>,
        <ion-content>
          <ion-list>
            {this.messages.map(msg => (
              <ion-item>
                <ion-label>
                  <h2>{msg.userId}</h2>
                  <p>{msg.text}</p>
                  <small>{new Date(msg.updatedAt).toLocaleTimeString()}</small>
                </ion-label>
              </ion-item>
            ))}
          </ion-list>
        </ion-content>,
        <ion-footer>
          <form onSubmit={(event) => this.sendMessage(event)}>
            <ion-item>
              <ion-input
                placeholder="Type a message"
                value={this.newMessage}
                onIonInput={(e: any) => this.newMessage = e.target.value}>
              </ion-input>
            </ion-item>
            <ion-button expand="full" type="submit">Send</ion-button>
          </form>
        </ion-footer>
    ];
  }
}