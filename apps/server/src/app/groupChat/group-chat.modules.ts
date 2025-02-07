import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupKey, GroupKeySchema } from '../../schemas/group-key.schema';
import { GroupChatGateway } from './group-chat.gateway';
import { MessageModule } from '../message/message.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MessageModule, // ✅ Enthält bereits `MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])`
    MongooseModule.forFeature([
      { name: GroupKey.name, schema: GroupKeySchema }
    ]),
  ],
  providers: [GroupChatGateway],
  exports: [GroupChatGateway], // ✅ Falls andere Module `MessageService` nutzen wollen
})
export class GroupChatModule {}