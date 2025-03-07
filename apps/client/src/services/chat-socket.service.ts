import { io, Socket } from 'socket.io-client';

export class ChatSocketService {
  private static instance: ChatSocketService;
  public socket: Socket;
  private constructor(token: string) {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      auth: { token },
    });
  }

  public static getInstance(token: string): ChatSocketService {
    if (!ChatSocketService.instance) {
      ChatSocketService.instance = new ChatSocketService(token);
    }
    return ChatSocketService.instance;
  }

  /**
   * Join a single group.
   */
  public joinGroup(groupId: string): void {
    this.socket.emit('join-group', {groupId});
  }

  updateToken(newToken: string): void {
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
    ChatSocketService.instance = undefined as any;
  }
}