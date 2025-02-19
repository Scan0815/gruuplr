import { Component, h} from '@stencil/core';

@Component({
  tag: 'group-list',
  styleUrl: 'group-list.scss',
})
export class GroupList {
  groups = [
    { id: 'general', name: 'General' },
    { id: 'random', name: 'Random' },
    { id: 'support', name: 'Support' },
  ];

  render() {
    return (
      <ion-list>
        {this.groups.map((group) => (
          <ion-item href={`/chat/view/${group.id}`}>
            {group.name}
          </ion-item>
        ))}
      </ion-list>
    );
  }
}
