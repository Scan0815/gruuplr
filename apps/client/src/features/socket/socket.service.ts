import { io, Socket } from 'socket.io-client';

export class SocketService {
  private static instance: SocketService;
  private endpoint = 'http://localhost:3000';
  public socket: Socket;
  private constructor(token: string) {
    this.socket = io(this.endpoint, {
      transports: ['websocket'],
      auth: { token },
    });
  }

  public static getInstance(token: string): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService(token);
    }
    return SocketService.instance;
  }

  /**
   * Join a single group.
   */
  public joinGroup(groupId: string): void {
    this.socket.emit('join-group', {groupId});
  }

  public updateAuthToken(newToken: string): void {
    if((this.socket.auth as any).token !== newToken) {
      (this.socket.auth as any).token = newToken;
      this.socket.disconnect();
      this.socket.connect();
    }
  }

  /**
   * Join multiple groups.
   */
  public joinGroups(groupIds: string[]): void {
    console.log('Joining groups:', groupIds);
    groupIds.forEach((groupId) => this.joinGroup(groupId));
  }

  /**
   * Register a callback for incoming messages.
   */
  public onMessage(callback: (message: any) => void): void {
    this.socket.on('receive-message', callback);
  }

  public onErrorMessage(callback: (message: any) => void): void {
    this.socket.on('error', callback);
  }


  public onReplication(): void {
    this.socket.emit('requestReplication', { timestamp: Date.now() }, (response:any) => {
      if (response.success) {
        // Handle the replication records
        console.log('Received replication records:', response.records);
      } else {
        // Handle the error
        console.error('Failed to get replication records:', response.error);
      }
    });
  }
  /**
   * Send a message.
   */
  public sendMessage(messageData: any): void {
    this.socket.emit('send-message', messageData);
  }

  /**
   * Disconnect the socket.
   */
  public disconnect(): void {
    this.socket.disconnect();
    SocketService.instance = undefined as any;
  }
}