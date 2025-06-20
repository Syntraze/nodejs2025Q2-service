import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

export const PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly jwtVerifyOptions: JwtVerifyOptions;

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      throw new InternalServerErrorException(
        'JWT_SECRET_KEY environment variable is not defined',
      );
    }
    this.jwtVerifyOptions = { secret };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException(
        'Authorization header is missing or malformed',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtVerifyOptions,
      );

      request.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired JWT token');
    }
  }

  private extractTokenFromHeader(header?: string): string | undefined {
    if (!header) return undefined;
    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return undefined;
    }
    return parts[1];
  }
}
