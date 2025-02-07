import { Component, ComponentInterface, h, Prop, State } from '@stencil/core';
import { RxDBService } from '../../services/rxdb.service';
import { IonTextareaCustomEvent } from '@ionic/core';
import { ReplicationService } from '../../services/replication.service';

@Component({
  tag: 'rxdb-test',
  styleUrl: 'rxdb-test.scss',
})
export class RxDbTest implements ComponentInterface {
  @State() text: string;
  @Prop() userId: string = '1';
  @State() messages: any[] = [];
  private replicationId = this.userId === '1' ? '2' : '1';

  private formEl: HTMLFormElement;
  private textAreaEl: HTMLIonTextareaElement;
  private rxDb: RxDBService = new RxDBService();
  private replicationService: ReplicationService =  new ReplicationService(this.replicationId,this.syncMessages.bind(this));
  async componentDidLoad() {
    await this.rxDb.initialize();
    this.messages = await this.rxDb.getMessages(this.replicationId);
    this.messages = this.messages.sort((a,b) => a.updatedAt - b.updatedAt);
  }

  addText(ev:IonTextareaCustomEvent<string>){
    this.text = ev.target.value;
  }

  async createMessage(){
    if(this.text === '') return;
    await this.rxDb.addMessage(this.text,this.userId);
    await this.replicationService.pushMessage(this.text,this.userId);
    this.formEl.reset();
    this.textAreaEl.value = '';
    this.messages = await this.rxDb.getMessages(this.userId);
    this.messages = this.messages.sort((a,b) => a.updatedAt - b.updatedAt);
  }

  syncMessages(messages:any){
    this.messages.push(...messages);
    this.messages = this.messages.sort((a,b) => a.updatedAt - b.updatedAt);
    this.messages = [...this.messages];
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-title>Replication Messages</ion-title>
          <ion-buttons slot="end">
            <ion-button onClick={() => this.rxDb.clear()}>clear messages
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
      <ion-list>
        {this.messages.map((message) => {
          return <ion-item>{message.userId} - {message.id}/{message.text} - {message.updatedAt}</ion-item>
        })}
      </ion-list>
      <form ref={(ref: HTMLFormElement) => this.formEl = ref}>
        <ion-textarea fill="outline" shape="round" label="Label:" label-placement="floating"
                      ref={(ref: HTMLIonTextareaElement) => this.textAreaEl = ref}
                      onIonInput={(ev: IonTextareaCustomEvent<string>) => this.addText(ev)}></ion-textarea>
        <ion-button onClick={async () => {
          await this.createMessage()
        }}>add message
        </ion-button>
      </form>
    </ion-content>]
  }
}
