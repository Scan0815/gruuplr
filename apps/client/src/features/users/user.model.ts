// src/users/user.model.ts

import { UserDto } from '../../generated/graphql';

export interface User extends UserDto{
  id: string;
  name: string;
  eMail: string;
  accessToken: string;
  refreshToken: string;
  active: number;
  createdAt: Date;
  updatedAt: Date;
}

export type NewUser = Omit<User, 'id'>;