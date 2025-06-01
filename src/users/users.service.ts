import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

@Injectable()
export class UserService {
  private users: User[] = [];

  findAll(): Omit<User, 'password'>[] {
    return this.users.map(({ password, ...rest }) => rest);
  }

  findOne(id: string): Omit<User, 'password'> {
    if (!uuidValidate(id)) throw new BadRequestException('Invalid UUID');
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user;
    return rest;
  }

  create(createUserDto: CreateUserDto): Omit<User, 'password'> {
    if (!createUserDto.login || !createUserDto.password)
      throw new BadRequestException('Missing fields');

    const newUser: User = {
      id: uuidv4(),
      login: createUserDto.login,
      password: createUserDto.password,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.users.push(newUser);
    const { password, ...rest } = newUser;
    return rest;
  }

  updatePassword(
    id: string,
    updateDto: UpdatePasswordDto,
  ): Omit<User, 'password'> {
    if (!uuidValidate(id)) throw new BadRequestException('Invalid UUID');
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');

    if (user.password !== updateDto.oldPassword)
      throw new ForbiddenException('Incorrect old password');

    user.password = updateDto.newPassword;
    user.version++;
    user.updatedAt = Date.now();

    const { password, ...rest } = user;
    return rest;
  }

  remove(id: string): void {
    if (!uuidValidate(id)) throw new BadRequestException('Invalid UUID');
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new NotFoundException('User not found');
    this.users.splice(index, 1);
  }
}
