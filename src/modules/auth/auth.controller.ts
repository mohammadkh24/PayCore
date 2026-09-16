
import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and returns an access token.',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user data.',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists.',
  })
  register(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description:
      'Authenticates a user and returns an access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid login data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password.',
  })
  login(
    @Body() loginDto: LoginDto,
  ) {
    return this.authService.login(loginDto);
  }
}
