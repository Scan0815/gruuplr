import { BaseRxDBRepository } from '../rxdb/base-rxdb.repository';
import { GroupDto } from '../../generated/graphql';

const groupRxSchema = {
  title: 'groups',
  version: 0,
  description: 'Schema for group documents',
  primaryKey: 'id',
  type: 'object',
  // You can try to allow additional properties but also explicitly define internal fields:
  additionalProperties: true,
  properties: {
    id: { type: 'string', primary: true, maxLength: 20 },
    userId: { type: 'string' }, // Local cache field to track which user's cache this is
    name: { type: 'string' },
    description: { type: 'string' },
    createdAt: { type: 'number' },
    updatedAt: { type: 'number' },
    members: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          role: { type: 'string' },
        },
        required: ['userId', 'role'],
      },
    }
  },
  required: ['id', 'userId', 'name', 'createdAt', 'updatedAt'],
};

type LocalGroupDto = GroupDto & { userId: string };

export class GroupRepository extends BaseRxDBRepository<LocalGroupDto> {
  protected collectionName = 'groups';
  protected schema = groupRxSchema;

  constructor() {
    super();
  }
}