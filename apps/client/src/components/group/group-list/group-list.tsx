import { Component, ComponentInterface, h, State } from '@stencil/core';
import { Group } from 'apps/client/src/components';
import { GroupRepository } from '../../../features/group/group.repository';
import { GroupService } from '../../../features/group/group.service';
import { db } from '../../../db/AppDatabase';
import { ModalService } from '../../../modal/modal.service';

@Component({
  tag: 'group-list',
  styleUrl: 'group-list.scss',
})
export class GroupList implements ComponentInterface {
  @State() groups: Group[] = [];
  private openGroupCreateModal!: HTMLIonModalElement;

  private groupRepository = new GroupRepository(db);
  private groupService = GroupService.getInstance(this.groupRepository);

  async componentWillLoad() {
    console.log('Component Load GroupList');
    this.groupService.groups$.subscribe((groups: Group[]) => {
      console.log(groups);
      this.groups = groups;
    });
  }

  async closeModal() {
    await this.openGroupCreateModal.dismiss(null, 'cancel');
  }

  async editGroup(ev:MouseEvent,group: Group) {
    console.log(group);
    ev.preventDefault();
    ev.stopPropagation();

    const update = await ModalService.openModal("group-update", {group})
  console.log(update);
    if (update) {
      this.groups = await this.groupService.listGroups() || [];
    }
  }

  async deleteGroup(ev:MouseEvent,group: Group) {
    ev.preventDefault();
    ev.stopPropagation();
    await this.groupService.deleteGroup(group.id);
    this.groups = this.groups.filter((g) => g.id !== group.id);
  }

  async groupCreate(ev:MouseEvent) {
    ev.preventDefault();
    const create = await ModalService.openModal("group-create")
    if (create) {
      this.groups = await this.groupService.listGroups() || [];
    }
  }

  async groupJoin(ev:MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    const invite = await ModalService.openModal("group-join")
    if (invite) {
      this.groups = await this.groupService.listGroups() || [];
    }
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
        <ion-item onClick={(ev:MouseEvent) => this.groupCreate(ev)} button={true}  expand="block">
          Gruppe erstellen
        </ion-item>
        <ion-item onClick={(ev:MouseEvent) => this.groupJoin(ev)} button={true}  expand="block">
          Invite
        </ion-item>
      </ion-list>
    );
  }
}
