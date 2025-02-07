import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../../schemas/message.schema';
import { MessageDTO } from '../../dtos/message.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MessageService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>) {}

  // ✅ Nachrichten nach `groupId` und `since` abrufen
  async getMessages(groupId: string, since?: number):Promise<MessageDTO[]> {
    const query: any = { groupId };

    if (since) {
      query.createdAt = { $gt: new Date(since) }; // Nur Nachrichten nach `since`
    }

    const messages = await this.messageModel.find(query).sort({ createdAt: 1 }).lean().exec();
    return plainToInstance(MessageDTO, messages);
  }
}