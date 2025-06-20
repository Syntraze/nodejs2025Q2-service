import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserService } from 'src/users/users.service';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly saltRounds: number;
  private readonly jwtOptions: {
    access: JwtSignOptions;
    refresh: JwtSignOptions;
  };

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    const saltEnv = process.env.CRYPT_SALT;
    const secret = process.env.JWT_SECRET_KEY;
    const refreshSecret = process.env.JWT_SECRET_REFRESH_KEY;
    const expiresIn = process.env.TOKEN_EXPIRE_TIME;
    const refreshExpiresIn = process.env.TOKEN_REFRESH_EXPIRE_TIME;

    if (!saltEnv) {
      throw new InternalServerErrorException('Missing CRYPT_SALT env var');
    }
    if (!secret || !refreshSecret) {
      throw new InternalServerErrorException(
        'Missing JWT_SECRET_KEY or JWT_SECRET_REFRESH_KEY env var',
      );
    }
    if (!expiresIn || !refreshExpiresIn) {
      throw new InternalServerErrorException(
        'Missing TOKEN_EXPIRE_TIME or TOKEN_REFRESH_EXPIRE_TIME env var',
      );
    }

    this.saltRounds = parseInt(saltEnv, 10);

    this.jwtOptions = {
      access: { secret, expiresIn },
      refresh: { secret: refreshSecret, expiresIn: refreshExpiresIn },
    };
  }

  async signup(
    createUserDto: CreateUserDto,
  ): Promise<{ id: string; message: string }> {
    const { login, password } = createUserDto;

    let hashed: string;
    try {
      hashed = await bcrypt.hash(password, this.saltRounds);
    } catch (err) {
      throw new InternalServerErrorException('Password hashing failed');
    }

    try {
      const user = await this.userService.create({ login, password: hashed });
      return { id: user.id, message: 'User registered successfully' };
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Failed to create user');
    }
  }

  async login(createUserDto: CreateUserDto): Promise<Tokens> {
    const { login, password } = createUserDto;
    const user = await this.userService.findLogin(login);

    if (!user) {
      throw new UnauthorizedException('No user found with given login');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect password');
    }

    return this.generateTokens(user.id, user.login);
  }

  async refresh(token: string): Promise<Tokens> {
    if (!token) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    let payload: { userId: string; login: string };
    try {
      payload = await this.jwtService.verifyAsync(
        token,
        this.jwtOptions.refresh,
      );
    } catch {
      throw new ForbiddenException('Invalid or expired refresh token');
    }

    return this.generateTokens(payload.userId, payload.login);
  }

  private generateTokens(userId: string, login: string): Tokens {
    const payload = { userId, login };
    return {
      accessToken: this.jwtService.sign(payload, this.jwtOptions.access),
      refreshToken: this.jwtService.sign(payload, this.jwtOptions.refresh),
    };
  }
}
