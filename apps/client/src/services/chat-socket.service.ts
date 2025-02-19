import { io, Socket } from 'socket.io-client';

export class ChatSocketService {
  private static instance: ChatSocketService;
  public socket: Socket;

  // Private constructor ensures a singleton instance.
  private constructor(token: string) {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      auth: { token },
    });
  }

  // Get or create the singleton instance.
  public static getInstance(token: string): ChatSocketService {
    if (!ChatSocketService.instance) {
      ChatSocketService.instance = new ChatSocketService(token);
    }
    return ChatSocketService.instance;
  }

  /**
   * Sends a message as a JSON object. The message should include all
   * necessary fields (e.g. groupId, encryptedPayload, keyIndex, etc.)
   */
  public sendMessage(messageData: any) {
    this.socket.emit('send-message', messageData);
  }

  /**
   * Registers a callback for incoming messages.
   */
  public onMessage(callback: (message: any) => void) {
    this.socket.on('receive-message', callback);
  }

  /**
   * Disconnects the socket (e.g. on logout).
   */
  public disconnect() {
    this.socket.disconnect();
    ChatSocketService.instance = undefined as any;
  }
}