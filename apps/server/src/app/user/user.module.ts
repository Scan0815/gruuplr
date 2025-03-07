import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@gruuplr/schemas';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // ✅ Mongoose-Modell importieren
  ],
  providers: [UserService, UserResolver], // Füge den Resolver und den Service hinzu
  exports: [MongooseModule,UserService], // ✅ Falls andere Module `UserService` nutzen wollen
})
export class UserModule {}