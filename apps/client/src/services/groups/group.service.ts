import { GroupDto, Mutation, Query } from '../../generated/graphql';
import { gql } from 'graphql-tag';
import { CreateGroupInput } from '@gruuplr/dtos';
import { GraphQLService } from '../graphql/graphql.service';
import { GroupRepository } from './group.repository';
import { AccountService } from '../account.service';

export class GroupService {
  private static instance: GroupService;
  private groupRepo: GroupRepository = new GroupRepository();

  private constructor() {}

  public static getInstance(): GroupService {
    if (!GroupService.instance) {
      GroupService.instance = new GroupService();
    }
    return GroupService.instance;
  }

  async createGroup(name: string, description: string): Promise<GroupDto> {
    const CREATE_GROUP_MUTATION = gql`
        mutation CreateGroup($name: String!, $description: String!) {
            createGroup(input: { name: $name, description: $description }) {
                id
                name
                description
                createdAt
                updatedAt
                members {
                    userId
                    role
                }
            }
        }
    `;

    try {
      const response = await GraphQLService.getInstance()
        .request<Mutation, CreateGroupInput>(
        'http://localhost:3000/graphql',
        CREATE_GROUP_MUTATION,
        { name, description }
      );
      console.log('Group created:', response);
      // Cache the group in RxDB
      await this.groupRepo.upsert({
        id: response.createGroup.id,
        userId: AccountService.getInstance().getUser()?.id as string,
        name: response.createGroup.name,
        description: response.createGroup.description,
        createdAt: new Date(response.createGroup.createdAt).getTime(),
        updatedAt: new Date(response.createGroup.updatedAt).getTime(),
        members: response.createGroup.members,
      });
      return response.createGroup;
    } catch (error) {
      throw new Error('Failed to create group');
    }
  }

  async getMyGroups(): Promise<GroupDto[]> {
    let groups: GroupDto[] = [];
    // Try retrieving from RxDB cache first
    const docs = await this.groupRepo.find();
    groups = docs.map((doc) => ({
      id: doc.id,
      name: doc.name,
      userId: AccountService.getInstance().getUser()?.id as string,
      description: doc.description,
      createdAt: new Date(doc.createdAt).toISOString(),
      updatedAt: new Date(doc.updatedAt).toISOString(),
      members: doc.members,
    }));

    // If cache is empty, fetch from GraphQL and update cache.
    if (groups.length === 0) {
      const MY_GROUPS_QUERY = gql`
          query getGroupsForUser {
              getGroupsForUser {
                  id
                  name
                  description
                  createdAt
                  updatedAt
                  members {
                      userId
                      role
                  }
              }
          }
      `;
      const response = await GraphQLService.getInstance()
        .request<Query>(
        'http://localhost:3000/graphql',
        MY_GROUPS_QUERY,
        {}
      );
      groups = response.getGroupsForUser;
      for (const group of groups) {
        await this.groupRepo.upsert({
          id: group.id,
          name: group.name,
          userId: AccountService.getInstance().getUser()?.id as string,
          description: group.description,
          createdAt: new Date(group.createdAt).getTime(),
          updatedAt: new Date(group.updatedAt).getTime(),
          members: group.members,
        });
      }
    }
    return groups;
  }
}