import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { UserModule } from './user/user.module';
import { join } from 'path';
import { APP_FILTER } from '@nestjs/core';
import { ExceptionFilter } from '../filters/GqlExceptionFilter';
import { ReplicationModule } from './replication/replication.module';
import { GroupsModule } from './groups/groups.module';

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
    UserModule,
    AuthModule,
    ReplicationModule,
    GroupsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
  ],
})
export class AppModule {}