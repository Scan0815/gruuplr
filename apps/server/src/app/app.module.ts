import { Module } from '@nestjs/common';
import { MessageModule } from './message/message.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { GroupChatModule } from './groupChat/group-chat.modules';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { UserModule } from './user/user.module';
import { join } from 'path';
import { GroupModule } from './group/group.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.graphql'), // 📌 Automatische Schema-Generierung
      sortSchema: true, // (optional) sortiert das Schema für bessere Lesbarkeit
      playground: true, // GraphQL Playground aktivieren
    }),
    DatabaseModule,
    GroupChatModule,
    MessageModule,
    UserModule,
    GroupModule,
    AuthModule
  ]
})
export class AppModule {}