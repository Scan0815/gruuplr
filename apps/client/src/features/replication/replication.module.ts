import { ReplicationSocketService } from './replication-socket.service';
import { environment } from '../../environments/environment';

export class ReplicationModule {
  private static instance: ReplicationModule;
  private replicationSocketService: ReplicationSocketService;

  private constructor() {
    // Initialize the socket service with the server URL
    this.replicationSocketService = ReplicationSocketService.getInstance(environment.apiUrl);
  }

  public static getInstance(): ReplicationModule {
    if (!ReplicationModule.instance) {
      ReplicationModule.instance = new ReplicationModule();
    }
    return ReplicationModule.instance;
  }

  public getReplicationSocketService(): ReplicationSocketService {
    return this.replicationSocketService;
  }

  public initialize(): void {
    // Start polling for pending replications
    this.replicationSocketService.startReplicationPolling();
    console.log('Replication module initialized');
  }

  public cleanup(): void {
    // Stop polling and disconnect socket
    this.replicationSocketService.stopReplicationPolling();
    this.replicationSocketService.disconnect();
    console.log('Replication module cleaned up');
  }
} 