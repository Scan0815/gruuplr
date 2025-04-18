// src/replication/replication.gateway.ts
import { UseFilters, UseGuards } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ReplicationService } from './replication.service';
import { JwtAuthWsGuard } from '../auth/jwt/jwt-auth-ws.guard';
import { ReplicationRecord } from './schemas/replication-record.schema';
import { WsExceptionsFilter } from '../../filters/WsExceptions.filter';
import { GroupsService } from '../groups/groups.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3335'],
    credentials: true
  },
})
@UseFilters(WsExceptionsFilter)
export class ReplicationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private groupSubscriptions: Map<string, Set<Socket>> = new Map();

  constructor(
    private readonly replicationService: ReplicationService,
    private readonly groupsService: GroupsService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Clean up subscriptions
    this.groupSubscriptions.forEach((sockets, groupId) => {
      sockets.delete(client);
      if (sockets.size === 0) {
        this.groupSubscriptions.delete(groupId);
      }
    });
  }

  /**
   * Handles replication saving.
   * Expects a payload with an array of replication records.
   * Only saves records if the authenticated user is a member of the group.
   */
  @UseGuards(JwtAuthWsGuard)
  @SubscribeMessage('saveReplication')
  async handleSaveReplication(
    @MessageBody() data: { records: Partial<ReplicationRecord>[] },
    @ConnectedSocket() client: Socket,
  ): Promise<{ success: boolean; savedRecords: ReplicationRecord[]; error?: string }> {
    const userId = client.data.user?.id;
    console.log('saveReplication userId',userId);
    if (!userId) {
      return { success: false, savedRecords: [], error: 'Unauthenticated' };
    }

    try {
      // Prepare all records first
      const recordsToSave: ReplicationRecord[] = data.records.map(record => {
        console.log('saveReplication record',record);
        const recordData = record.data;
        
        return {
          ...record,
          userId,
          groupId: recordData.groupId || recordData.id || record.groupId || '',
          tableName: record.tableName || 'groups',
          operation: record.operation || 'add',
          data: recordData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      console.log('build recordsToSave',recordsToSave);

      // Save all records in a single operation
      await this.replicationService.saveReplication(userId, recordsToSave);
      console.log('saveReplication savedRecords',recordsToSave);

      // Emit group replication updates for each affected group
      const affectedGroups = new Set(recordsToSave.map(record => record.groupId));
      for (const groupId of affectedGroups) {
        await this.emitGroupReplicationUpdate(groupId);
      }

      return { success: true, savedRecords: recordsToSave };
    } catch (error) {
      console.error('Failed to save replication records:', error);
      return { success: false, savedRecords: [], error: error.message };
    }
  }

  /**
   * Handles requesting replication records since a specific timestamp.
   * Returns all replication records for groups the user is a member of.
   */
  @UseGuards(JwtAuthWsGuard)
  @SubscribeMessage('requestReplication')
  async handleRequestReplication(
    @MessageBody() data: { timestamp: number },
    @ConnectedSocket() client: Socket,
  ): Promise<{ success: boolean; records?: ReplicationRecord[]; error?: string }> {
    const userId = client.data.user?.id;
    console.log('requestReplication userId', userId);
    if (!userId) {
      return { success: false, error: 'Unauthenticated' };
    }

    try {
      const timestamp = new Date(data.timestamp);
      console.log('requestReplication timestamp', timestamp);

      const records = await this.replicationService.getReplicationsSince(userId, timestamp);
      console.log('requestReplication records', records);

      return { success: true, records };
    } catch (error) {
      console.error('Failed to get replication records:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handles registering a client for group replication updates
   */
  @UseGuards(JwtAuthWsGuard)
  @SubscribeMessage('registerGroup')
  handleRegisterGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ): { success: boolean } {
    const { groupId } = data;
    if (!this.groupSubscriptions.has(groupId)) {
      this.groupSubscriptions.set(groupId, new Set());
    }
    this.groupSubscriptions.get(groupId)?.add(client);
    console.log(`Client ${client.id} registered for group ${groupId}`);
    return { success: true };
  }

  /**
   * Handles unregistering a client from group replication updates
   */
  @UseGuards(JwtAuthWsGuard)
  @SubscribeMessage('unregisterGroup')
  handleUnregisterGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ): { success: boolean } {
    const { groupId } = data;
    const sockets = this.groupSubscriptions.get(groupId);
    if (sockets) {
      sockets.delete(client);
      if (sockets.size === 0) {
        this.groupSubscriptions.delete(groupId);
      }
    }
    console.log(`Client ${client.id} unregistered from group ${groupId}`);
    return { success: true };
  }

  /**
   * Handles registering a client for multiple group replication updates
   */
  @UseGuards(JwtAuthWsGuard)
  @SubscribeMessage('registerGroups')
  handleRegisterGroups(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupIds: string[] },
  ): { success: boolean } {
    const { groupIds } = data;
    groupIds.forEach(groupId => {
      if (!this.groupSubscriptions.has(groupId)) {
        this.groupSubscriptions.set(groupId, new Set());
      }
      this.groupSubscriptions.get(groupId)?.add(client);
      console.log(`Client ${client.id} registered for group ${groupId}`);
    });
    return { success: true };
  }

  /**
   * Emits a replication update to all clients subscribed to a group
   */
  private async emitGroupReplicationUpdate(groupId: string): Promise<void> {
    const sockets = this.groupSubscriptions.get(groupId);
    if (sockets) {
      const timestamp = Date.now();
      const records = await this.replicationService.getReplicationsSince(groupId, new Date(timestamp - 1000)); // Get records from last second
      if (records.length > 0) {
        sockets.forEach(socket => {
          socket.emit('groupReplicationUpdate', { groupId, records });
        });
      }
    }
  }

  /**
   * Handles creating a new group invite
   */
  @UseGuards(JwtAuthWsGuard)
  @SubscribeMessage('createGroupInvite')
  async handleCreateGroupInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ): Promise<{ success: boolean; inviteCode?: string; error?: string }> {
    const userId = client.data.user?.id;
    if (!userId) {
      return { success: false, error: 'Unauthenticated' };
    }

    console.log("replication.gateway",data);
    try {
      const invite = await this.groupsService.createInvite(data.groupId, userId);
      return { success: true, inviteCode: invite.inviteCode };
    } catch (error) {
      console.error('Failed to create group invite:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handles using a group invite
   */
  @UseGuards(JwtAuthWsGuard)
  @SubscribeMessage('useGroupInvite')
  async handleUseGroupInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { inviteCode: string },
  ): Promise<{ success: boolean; error?: string }> {
    const userId = client.data.user?.id;
    if (!userId) {
      return { success: false, error: 'Unauthenticated' };
    }

    console.log("invite to group",data)

    try {
      const success = await this.groupsService.useInvite(data.inviteCode, userId);
      if (!success) {
        return { success: false, error: 'Invalid or expired invite code' };
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to use group invite:', error.meesage);
      return { success: false, error: error.message };
    }
  }
}