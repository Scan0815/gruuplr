import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../../schemas/message.schema';
import * as crypto from 'crypto';
import { GroupKey } from '../../schemas/group-key.schema';
import { UseGuards } from '@nestjs/common';
import { JwtAuthWsGuard } from '../auth/auth-ws.guard';

@WebSocketGateway({ cors: { origin: '*' }, transports: ['websocket'] })
export class GroupChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(GroupKey.name) private groupKeyModel: Model<GroupKey>
  ) {}

  handleConnection(client: Socket) {
    console.log(`✅ Client verbunden: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client getrennt: ${client.id}`);
  }

  // Nachricht speichern & verteilen
  @UseGuards(JwtAuthWsGuard)
  @SubscribeMessage('send-message')
  async sendMessage(
    client: Socket,
    @MessageBody()
    {
      groupId,
      encryptedPayload,
    }: {
      groupId: string;
      encryptedPayload: Buffer;
    }
  ) {
    const message = new this.messageModel({
      groupId,
      encryptedMessage: encryptedPayload, // Speichern als Binär
      keyIndex: 1,
    });

    await message.save(); // Speichert die Nachricht in MongoDB

    this.server.to(groupId).emit('receive-message', message);
  }

  // Verpasste Nachrichten abrufen
  @UseGuards(JwtAuthWsGuard)
  @SubscribeMessage('get-messages-since')
  async getMessagesSince(
    client: Socket,
    @MessageBody() { groupId, since }: { groupId: string; since: number }
  ) {
    const missedMessages = await this.messageModel
      .find({
        groupId,
        timestamp: { $gt: new Date(since) },
      })
      .sort({ timestamp: 1 });

    client.emit('receive-missed-messages', missedMessages);
  }

  @UseGuards(JwtAuthWsGuard)
  @SubscribeMessage('rotate-group-key')
  async rotateGroupKey(
    client: Socket,
    @MessageBody() { groupId }: { groupId: string }
  ) {
    const newKey = crypto.randomBytes(32);
    const newIndex = Date.now();

    await this.groupKeyModel.findOneAndUpdate(
      { groupId },
      { key: newKey, keyIndex: newIndex, updatedAt: new Date() },
      { upsert: true }
    );

    this.server.to(groupId).emit('new-group-key', { groupId, newIndex });
  }
}
