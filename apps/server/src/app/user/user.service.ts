import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../schemas/user.schema';
import { UserDTO } from '../../dtos/user.dto';
import { plainToInstance } from 'class-transformer';
import { verifyPassword } from '../auth/auth.utils';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  // ✅ Benutzer erstellen (Registrierung)
  async createUser(username: string, password: string): Promise<UserDTO> {
    const existingUser = await this.userModel.findOne({ username }).exec();
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }
    const newUser = new this.userModel({ username , password:password?.trim()});
    const savedUser = await newUser.save();
    return  plainToInstance(UserDTO, savedUser, { excludeExtraneousValues: true });
  }

  // ✅ Benutzer abrufen
  async getUserById(id: string): Promise<UserDTO> {
    const user = await this.userModel.findById(id).lean().exec();
    if (!user) throw new NotFoundException('User not found');
    return plainToInstance(UserDTO, user, { excludeExtraneousValues: true });
  }

  // ✅ Benutzer abrufen anhand des Usernames (für Login)
  async getUserByUsername(username: string): Promise<User | null> {
    return await this.userModel.findOne({ username }).exec();
  }

  // ✅ Passwort validieren & JWT ausstellen
  async validateUser(username: string, password: string): Promise<string | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    const userToUse = plainToInstance(UserDTO, user, { excludeExtraneousValues: true })
    const isMatch = await verifyPassword(password, user.password);
    console.log('isMatch', isMatch);
    if (!isMatch) return null;
    console.log('user', userToUse);
    // ✅ JWT-Token generieren
    return this.signUser({...userToUse});
  }

  signUser(user: UserDTO): string {
    return this.jwtService.sign({...user});
  }

}