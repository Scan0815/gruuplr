import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '@gruuplr/schemas';
import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]), // ✅ Mongoose-Modell importieren
  ],
  providers: [MessageService, MessageResolver],
  exports: [MongooseModule,MessageService], // ✅ Falls andere Module `MessageService` nutzen wollen
})
export class MessageModule {}