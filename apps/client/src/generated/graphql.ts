export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type AuthResponseDto = {
  __typename?: 'AuthResponseDTO';
  refreshToken: Scalars['String']['output'];
  token: Scalars['String']['output'];
  user: UserDto;
};

export type CreateGroupInput = {
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateUserInput = {
  eMail: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type GroupDto = {
  __typename?: 'GroupDTO';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type GroupMemberDto = {
  __typename?: 'GroupMemberDTO';
  createdAt: Scalars['DateTime']['output'];
  groupId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  role: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type LoginUserInput = {
  eMail: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createGroup: GroupDto;
  login: AuthResponseDto;
  refreshToken: AuthResponseDto;
  register: AuthResponseDto;
};


export type MutationCreateGroupArgs = {
  input: CreateGroupInput;
};


export type MutationLoginArgs = {
  input: LoginUserInput;
};


export type MutationRefreshTokenArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  input: CreateUserInput;
};

export type Query = {
  __typename?: 'Query';
  getGroupById: GroupDto;
  getGroupMembers: Array<GroupMemberDto>;
  getGroups: Array<GroupDto>;
  getUser: UserDto;
  me: UserDto;
};


export type QueryGetGroupByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetGroupMembersArgs = {
  groupId: Scalars['String']['input'];
};


export type QueryGetUserArgs = {
  id: Scalars['String']['input'];
};

export type UserDto = {
  __typename?: 'UserDTO';
  createdAt: Scalars['DateTime']['output'];
  eMail: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  role: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};
