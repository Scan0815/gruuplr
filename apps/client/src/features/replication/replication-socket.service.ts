import { io, Socket } from 'socket.io-client';
import { ReplicationRecord } from './replication.model';
import { db } from '../../db/AppDatabase';
import { AccountGraphQL } from '../account/account.graphql';
import { AccountService } from '../account/account.service';
import { GroupService } from '../groups/group.service';
import { GroupRepository } from '../groups/group.repository';
import { Group } from '../groups/group.model';
import { KeyStoreEntry } from '../keystore/keystore.model';
import { KeystoreService } from '../keystore/keystore.service';
import { KeystoreRepository } from '../keystore/keystore.repository';

export class ReplicationSocketService {
  private static instance: ReplicationSocketService;
  private socket: Socket;
  private replicationPollingInterval: any;
  private token: string | null = null;
  private groupService: GroupService;
  private keystoreService: KeystoreService;
  private registeredGroups: Set<string> = new Set();

  private constructor(private serverUrl: string) {
    const groupRepository = new GroupRepository(db);
    const keystoreRepository = new KeystoreRepository(db);
    this.groupService = new GroupService(groupRepository);
    this.keystoreService = new KeystoreService(keystoreRepository);
    
    // Get initial token
    const accountService = AccountService.getInstance();
    this.token = accountService.getToken();

    // Initialize socket with proper configuration
    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true,
      auth: {
        token: this.token
      },
      withCredentials: true
    });

    this.registerSocketEvents();
  }

  public static getInstance(serverUrl: string): ReplicationSocketService {
    if (!ReplicationSocketService.instance) {
      ReplicationSocketService.instance = new ReplicationSocketService(serverUrl);
    }
    return ReplicationSocketService.instance;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  public updateAuthToken(newToken: string): void {
    this.token = newToken;
    if (this.socket) {
      this.socket.auth = { token: newToken };
      this.socket.disconnect().connect();
    }
  }

  /**
   * Register a group ID to receive replication updates
   */
  public registerGroup(groupId: string): void {
    if (!this.registeredGroups.has(groupId)) {
      this.registeredGroups.add(groupId);
      this.socket.emit('registerGroup', { groupId });
      console.log('Registered for group updates:', groupId);
    }
  }

  /**
   * Unregister a group ID from receiving replication updates
   */
  public unregisterGroup(groupId: string): void {
    if (this.registeredGroups.has(groupId)) {
      this.registeredGroups.delete(groupId);
      this.socket.emit('unregisterGroup', { groupId });
      console.log('Unregistered from group updates:', groupId);
    }
  }

  /**
   * Register multiple group IDs at once
   */
  public registerGroups(groupIds: string[]): void {
    groupIds.forEach(groupId => this.registerGroup(groupId));
  }

  /**
   * Unregister multiple group IDs at once
   */
  public unregisterGroups(groupIds: string[]): void {
    groupIds.forEach(groupId => this.unregisterGroup(groupId));
  }

  private registerSocketEvents(): void {
    this.socket.on('connect', async () => {
      console.log('Replication socket connected:', this.socket.id);
      // Re-register all groups after reconnection
      if (this.registeredGroups.size > 0) {
        this.socket.emit('registerGroups', { groupIds: Array.from(this.registeredGroups) });
      }
      await this.sendPendingReplications();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (error.message === 'Invalid token') {
        this.handleTokenRefresh();
      }
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Replication socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.socket.connect();
      }
    });

    // Listen for incoming replication data from the server
    this.socket.on('replication', async (record: ReplicationRecord) => {
      console.log('Received replication record:', record);
      await this.handleIncomingReplication(record);
    });

    // Listen for bulk replication data from the server
    this.socket.on('bulkReplication', async (records: ReplicationRecord[]) => {
      console.log('Received bulk replication records:', records);
      await this.handleBulkReplication(records);
    });

    // Listen for group replication updates
    this.socket.on('groupReplicationUpdate', (data: { groupId: string; timestamp: number }) => {
      console.log('Received group replication update:', data);
      // Request replication data for this group since the timestamp
      this.requestReplicationSince(localStorage.getItem('lastReplicationRequest') ? parseInt(localStorage.getItem('lastReplicationRequest') as string) : 0);
    });

    // Listen for acknowledgements or other replication-related events
    this.socket.on('replicationAck', (data: { recordId: number; success: boolean }) => {
      if (data.success) {
        db.replicationQueue.delete(data.recordId).catch(error => {
          console.error('Error deleting replication record:', error);
        });
      }
    });

    this.socket.on('error', async (error: any) => {
      console.error('Replication socket error:', error);
      if(error.code === 'TOKEN_INVALID'){
        const result = await AccountGraphQL.refreshToken(AccountService.getInstance().getRefreshToken() as string);
        if(result){
          AccountService.getInstance().updateTokens(result.token,result.refreshToken);
          this.updateAuthToken(result.token);
        }
      }
    });
  }

  private async handleTokenRefresh(): Promise<void> {
    try {
      const accountService = AccountService.getInstance();
      const refreshToken = accountService.getRefreshToken();
      if (refreshToken) {
        const result = await AccountGraphQL.refreshToken(refreshToken);
        if (result) {
          accountService.updateTokens(result.token, result.refreshToken);
          this.updateAuthToken(result.token);
        }
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }

  /**
   * Requests and receives all replication records newer than the specified timestamp
   */
  async requestReplicationSince(timestamp: number): Promise<ReplicationRecord[]|undefined> {
    return new Promise((resolve) => {
      this.socket.emit('requestReplication', { timestamp }, (response: { success: boolean;records?:ReplicationRecord[]; error?: string }) => {
        if (response.success) {
          console.log('Successfully requested replication data since:', new Date(timestamp));
          console.log('Received replication records:', response.records);
          resolve(response.records);
        } else {
          console.error('Failed to request replication data:', response.error);
          resolve(undefined);
        }
      });
    });
  }

  /**
   * Handles bulk replication data from the server
   */
  async handleBulkReplication(records: ReplicationRecord[]): Promise<void> {
    try {
      for (const record of records) {
        await this.handleIncomingReplication(record);
      }
      console.log('Successfully processed bulk replication records');
    } catch (error) {
      console.error('Failed to handle bulk replication:', error);
      throw error;
    }
  }

  /**
   * Handles incoming replication data from the server
   */
  private async handleIncomingReplication(record: ReplicationRecord): Promise<void> {
    try {
      // Set a flag to prevent middleware from triggering during this operation
      (window as any).__isReplicating = true;

      switch (record.tableName) {
        case 'groups':
          const groupData = record.data as Group;
          const existingGroup = await this.groupService.getGroupById(groupData.id);
          
          if (record.operation === 'delete') {
            await this.groupService.deleteGroup(groupData.id);
          } else if (existingGroup) {
            // If group exists, update it
            await this.groupService.updateGroup(groupData.id, groupData);
          } else {
            // If group doesn't exist, create it
            await this.groupService.createGroup(groupData);
          }
          break;

        case 'keystore':
          const keystoreData = record.data as KeyStoreEntry;
          const existingKeystore = await this.keystoreService.getKey(keystoreData.id, keystoreData.groupId);
          
          if (record.operation === 'delete') {
            // Note: We don't actually delete keys, we just skip them
            console.warn('Attempted to delete key, skipping:', keystoreData.id);
          } else if (!existingKeystore) {
            // Only create new keys, never update existing ones
            await this.keystoreService.addKey(keystoreData.groupId, keystoreData.encryptionKey);
          } else {
            console.warn('Attempted to update existing key, skipping:', keystoreData.id);
          }
          break;

        default:
          console.warn(`Unknown table name in replication record: ${record.tableName}`);
      }
    } catch (error) {
      console.error('Failed to handle incoming replication:', error);
      throw error;
    } finally {
      // Clear the flag after operation is complete
      (window as any).__isReplicating = false;
    }
  }

  /**
   * Fetches pending replication records from IndexedDB and emits them to the server.
   */
  async sendPendingReplications(): Promise<void> {
    try {
      const pending: ReplicationRecord[] = await db.replicationQueue.toArray();
      if (pending.length) {
        console.log('Sending pending replications:', pending);
        this.socket.emit('saveReplication', {records:pending}, (ack: { success: boolean }) => {
          console.log("send replication",ack.success,pending);
          if (ack.success) {
            pending.forEach(record => {
              db.replicationQueue.delete(record.id!).catch(error => {
                console.error('Error deleting replication record:', error);
              });
            });
          } else {
            console.warn('Replication record not acknowledged:', pending);
          }
        });
      } else {
        console.log('No pending replication records.');
      }
    } catch (error) {
      console.error('Error fetching pending replications:', error);
    }
  }

  /**
   * Starts polling the replication queue at a defined interval.
   */
  public startReplicationPolling(intervalMs = 5000): void {
    if (this.replicationPollingInterval) {
      clearInterval(this.replicationPollingInterval);
    }
    this.replicationPollingInterval = setInterval(async () => {
      await this.sendPendingReplications();
    }, intervalMs);
  }

  /**
   * Stops the replication polling.
   */
  stopReplicationPolling(): void {
    if (this.replicationPollingInterval) {
      clearInterval(this.replicationPollingInterval);
      this.replicationPollingInterval = null;
    }
  }

  /**
   * Creates a new group invite
   */
  public createGroupInvite(groupId: string): Promise<{ success: boolean; inviteCode?: string; error?: string }> {
    return new Promise((resolve) => {
      this.socket.emit('createGroupInvite', { groupId }, (response: { success: boolean; inviteCode?: string; error?: string }) => {
        resolve(response);
      });
    });
  }

  /**
   * Uses a group invite code
   */
  public useGroupInvite(inviteCode: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.socket.emit('useGroupInvite', { inviteCode }, (response: { success: boolean; error?: string }) => {
        resolve(response);
      });
    });
  }
}