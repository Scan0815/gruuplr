import { Component, ComponentInterface, h, State } from '@stencil/core';
import { GroupCreateCustomEvent } from 'apps/client/src/components';
import { GroupDto } from '../../../generated/graphql';
import { GroupService } from '../../../services/groups/group.service';

@Component({
  tag: 'group-list',
  styleUrl: 'group-list.scss',
})
export class GroupList implements ComponentInterface {
  @State() groups: GroupDto[] = [];
  private openGroupCreateModal!: HTMLIonModalElement;

  async componentDidLoad() {
    try {
      this.groups = await GroupService.getInstance().getMyGroups();
    }catch (error:any) {
        console.error('Unknown error', error);
    }
  }

  async closeModal() {
    await this.openGroupCreateModal.dismiss(null, 'cancel');
  }

  groupCreated(ev: GroupCreateCustomEvent<GroupDto>) {
    this.groups.push(ev.detail);
    this.groups = [...this.groups];
  }

  groupCreate() {
    return (
      <ion-modal
        ref={(ref: HTMLIonModalElement) => (this.openGroupCreateModal = ref)}
        trigger="open-group-create">
        <group-create onGroupCreated={(ev) => this.groupCreated(ev)} />
      </ion-modal>
    );
  }

  render() {
    return (
      <ion-list>
        {this.groups.map((group) => (
          <ion-item href={`/chat/view/${group.id}`}>{group.name}</ion-item>
        ))}
        <ion-item id="open-group-create" button={true} expand="block">
          Gruppe erstellen
        </ion-item>
        {this.groupCreate()}
      </ion-list>
    );
  }
}
