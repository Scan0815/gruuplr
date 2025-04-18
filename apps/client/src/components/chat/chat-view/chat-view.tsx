import { Component, h, Prop, State, Watch } from '@stencil/core';
import { GroupService } from '../../../features/group/group.service';
import { Group } from '../../../features/group/group.model';
import { KeystoreService } from '../../../features/keystore/keystore.service';
import { UserService } from '../../../features/users/user.service';
import { User } from '../../../features/users/user.model';
import { ModalService } from '../../../modal/modal.service';

@Component({
  tag: 'chat-view',
  styleUrl: 'chat-view.scss',
})
export class ChatView {
  @Prop() groupId!: string;
  @State() group: Group|null = null;
  @State() messages: any[] = [];
  @State() newMessage: string = '';
  @State() showInviteModal: boolean = false;

  private groupService = GroupService.getInstance();
  private userService = new UserService();
  private keystoreService = new KeystoreService();

  async componentDidLoad() {
    this.group = await this.groupService.getGroupById(this.groupId) as Group;
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

    }
  }

  async sendMessage(event: Event) {
    event.preventDefault();
    if (!this.newMessage || !this.groupId) return;
    const user = await this.userService.getActiveAccount() as User;
    const keyStore= await this.keystoreService.getActiveKey(this.groupId)

    console.log('Raw key:', keyStore,user);
/*
    const { iv, ciphertext } = await WebCryptoService.encryptMessage(this.newMessage, keyStore?.encryptionKey);
    console.log('Encrypted:', { iv, ciphertext });

    const decryptedText = await WebCryptoService.decryptMessage(ciphertext, aesKey, iv);
    console.log('Decrypted:', decryptedText);

    this.socketService.sendMessage({
      groupId:this.groupId,
      userId:userId,
      encryptedMessage:ciphertext,
      iv,
      keyId: userId
    });

    */
    this.newMessage = '';
    //await this.loadMessages();
  }

  async showActionSheet() {
    const actionSheet = document.createElement('ion-action-sheet');
    actionSheet.header = 'Group Actions';
    actionSheet.buttons = [
      {
        text: 'Invite Members',
        icon: 'person-add-outline',
        handler: () => ModalService.openModal("group-invite",{groupId: this.groupId})
      },
      {
        text: 'Leave Group',
        icon: 'exit-outline',
        role: 'destructive',
        handler: () => {
          console.log('Leave group clicked');
        }
      },
      {
        text: 'Cancel',
        icon: 'close-outline',
        role: 'cancel'
      }
    ];

    document.body.appendChild(actionSheet);
    await actionSheet.present();
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-title>Chat - {this.group?.name}</ion-title>
          <ion-buttons slot="end">
            <ion-button onClick={() => this.showActionSheet()}>
              <ion-icon slot="icon-only" name="ellipsis-vertical-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
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