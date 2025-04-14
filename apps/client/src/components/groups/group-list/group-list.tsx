import { Component, ComponentInterface, h, State } from '@stencil/core';
import { Group, GroupCreateCustomEvent } from 'apps/client/src/components';
import { GroupRepository } from '../../../features/groups/group.repository';
import { GroupService } from '../../../features/groups/group.service';
import { db } from '../../../db/AppDatabase';
import { ReplicationModule } from 'apps/client/src/features/replication/replication.module';

@Component({
  tag: 'group-list',
  styleUrl: 'group-list.scss',
})
export class GroupList implements ComponentInterface {
  @State() groups: Group[] = [];
  private openGroupCreateModal!: HTMLIonModalElement;

  private groupRepository = new GroupRepository(db);
  private groupService = new GroupService(this.groupRepository);
  private replicationSocketService = ReplicationModule.getInstance().getReplicationSocketService();
  async componentWillLoad() {
  this.groupService.groups$.subscribe(groups => {
    this.groups = groups;
    this.replicationSocketService?.registerGroups(groups.map((group) => group.id));
  });
  }

  async closeModal() {
    await this.openGroupCreateModal.dismiss(null, 'cancel');
  }

  async groupCreated(_ev: GroupCreateCustomEvent<Group>) {
    this.groups = await this.groupService.listGroups() || [];
    await this.openGroupCreateModal.dismiss(null, 'cancel');
  }

  async editGroup(ev:MouseEvent,group: Group) {
    console.log(group);
    ev.preventDefault();
    ev.stopPropagation();
    await this.openGroupCreateModal.dismiss(null, 'cancel');
    await this.openGroupCreateModal.present();
  }

  async deleteGroup(ev:MouseEvent,group: Group) {
    ev.preventDefault();
    ev.stopPropagation();
    await this.groupService.deleteGroup(group.id);
    this.groups = this.groups.filter((g) => g.id !== group.id);
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
          <ion-item href={`/chat/view/${group.id}`}>{group.name}<ion-buttons slot="end">
            <ion-button onClick={(ev:MouseEvent) => this.editGroup(ev,group)}>
              <ion-icon slot="icon-only" name="create-outline"></ion-icon>
            </ion-button>
            <ion-button onClick={(ev:MouseEvent) => this.deleteGroup(ev,group)}>
              <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
            </ion-button>

          </ion-buttons></ion-item>
        ))}
        <ion-item id="open-group-create" button={true} expand="block">
          Gruppe erstellen
        </ion-item>
        {this.groupCreate()}
      </ion-list>
    );
  }
}
