import { BaseRxDBRepository } from '../rxdb/base-rxdb.repository';
import { UserDto } from '../../generated/graphql';

const userRxSchema = {
  title: 'users',
  version: 0,
  description: 'Schema for users documents',
  primaryKey: 'id',
  type: 'object',
  // You can try to allow additional properties but also explicitly define internal fields:
  additionalProperties: true,
  properties: {
    id: { type: 'string', primary: true, maxLength: 20 },
    name: { type: 'string' },
    accessToken:{ type: 'string' },
    refreshToken:{ type: 'string' },
    active:{ type: 'boolean' },
    createdAt: { type: 'number' },
    updatedAt: { type: 'number' },
  },
  required: ['id', 'name','accessToken','refreshToken', 'createdAt', 'updatedAt'],
};

export type LocalUserDto = UserDto & {accessToken?: string, refreshToken?: string, active?: boolean};

export class UserRepository extends BaseRxDBRepository<LocalUserDto> {
  protected collectionName = 'users';
  protected schema = userRxSchema;

  constructor() {
    super();
  }
}