import { GraphQLService } from '../../graphql/graphql.service';
import { gql } from 'graphql-tag';
import { CreateGroupInput, GroupDto, GroupMemberDto, Mutation, Query } from '../../generated/graphql';

export class GroupGraphQL {
  private static graphqlService = GraphQLService.getInstance();
  private static endpoint = 'http://localhost:3000/graphql';

  /**
   * Creates a new group via GraphQL.
   *
   * @param name The group name
   * @param description Optional group description
   * @returns The newly created group details
   */
  static async createGroup(name: string, description: string): Promise<GroupDto> {
    const mutation = gql`
      mutation CreateGroup($input: CreateGroupInput!) {
        createGroup(input: $input) {
          id
          name
          description
          createdAt
          updatedAt
        }
      }
    `;

    const variables = { input: { name, description } };
    const result = await this.graphqlService.request<Mutation, { input: CreateGroupInput }>(
      this.endpoint,
      mutation,
      variables
    );

    return result.createGroup;
  }

  /**
   * Gets all groups for the current user.
   *
   * @returns List of groups the user is a member of
   */
  static async getGroups(): Promise<GroupDto[]> {
    const query = gql`
      query GetGroups {
        getGroups {
          id
          name
          description
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.graphqlService.request<Query>(
      this.endpoint,
      query
    );

    return result.getGroups;
  }

  /**
   * Gets a specific group by ID.
   *
   * @param id The group ID
   * @returns The group details
   */
  static async getGroupById(id: string): Promise<GroupDto> {
    const query = gql`
      query GetGroupById($id: String!) {
        getGroupById(id: $id) {
          id
          name
          description
          createdAt
          updatedAt
        }
      }
    `;

    const variables = { id };
    const result = await this.graphqlService.request<Query>(
      this.endpoint,
      query,
      variables
    );

    return result.getGroupById;
  }

  /**
   * Gets all members of a specific group.
   *
   * @param groupId The group ID
   * @returns List of group members
   */
  static async getGroupMembers(groupId: string): Promise<GroupMemberDto[]> {
    const query = gql`
      query GetGroupMembers($groupId: String!) {
        getGroupMembers(groupId: $groupId) {
          id
          userId
          groupId
          role
          isActive
          createdAt
          updatedAt
        }
      }
    `;

    const variables = { groupId };
    const result = await this.graphqlService.request<Query>(
      this.endpoint,
      query,
      variables
    );

    return result.getGroupMembers;
  }
} 