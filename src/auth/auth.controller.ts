import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { Public } from './guards/auth.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('login')
  @Public()
  login(@Body() createUserDto: CreateUserDto) {
    return this.authService.login(createUserDto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  refresh(@Body() { refreshToken }: { refreshToken: string }) {
    return this.authService.refresh(refreshToken);
  }
}
