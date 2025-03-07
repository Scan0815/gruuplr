import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GroupKey, Message } from '@gruuplr/schemas';
import * as crypto from 'crypto';

import { UseFilters, UseGuards } from '@nestjs/common';
import { JwtAuthWsGuard } from '../auth/jwt/jwt-auth-ws.guard';
import { WsExceptionsFilter } from '../../filters/WsExceptions.filter';
import { WsGroupException } from '../../exceptions/WsGroupException';

@WebSocketGateway({ cors: { origin: '*' }, transports: ['websocket'] })
@UseFilters(new WsExceptionsFilter()) // Apply the filter at the gateway level
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

  // Join group handler
  @UseGuards(JwtAuthWsGuard)
  @SubscribeMessage('join-group')
  joinGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string }
  ) {
    if (!data.groupId) {
      throw new WsGroupException('Group id not provided',"GROUP_ID_MISSING");
    }
    client.join(data.groupId);
    console.log(`Client ${client.id} joined group ${data.groupId}`);
  }

  // Nachricht speichern & verteilen
  @UseGuards(JwtAuthWsGuard)
  @SubscribeMessage('send-message')
  async sendMessage(
    @MessageBody()
    data: {
      groupId: string;
      userId: string;
      encryptedMessage: string;
      keyId: string;
    }
  ) {

    // convert string to ObjectId
    const groupId = new Types.ObjectId(data.groupId);
    const userId = new Types.ObjectId(data.userId);
    const keyId = new Types.ObjectId(data.keyId);

    //generate new message
    const message = new this.messageModel(Object.assign(data,{groupId,userId,keyId}));

    // Save message to MongoDB
    await message.save();

    //message to all clients in the group
    this.server.to(data.groupId).emit('receive-message', message);
  }

  // Verpasste Nachrichten abrufen
  @UseGuards(JwtAuthWsGuard)
  @SubscribeMessage('get-messages-since')
  async getMessagesSince(
    @ConnectedSocket() client: Socket,
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
    @ConnectedSocket() client: Socket,
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
