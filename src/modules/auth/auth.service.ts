import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entities/user.entity';

import { AuthMessages } from 'src/common/enums/messages.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,

    private readonly userService: UserService,
  ) {}

  async generateToken(
    user: { id: string; email: string },
  ) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.signAsync(payload);
  }

  async register(
    createUserDto: CreateUserDto,
  ) {
    const user =
      await this.userService.create(
        createUserDto,
      );

    const accessToken =
      await this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    };
  }

  async login(
    loginDto: LoginDto,
  ) {
    const user =
      await this.userRepository.findOne({
        where: {
          email: loginDto.email,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        AuthMessages.INVALID_CREDENTIALS,
      );
    }

    const passwordIsValid =
      await bcrypt.compare(
        loginDto.password,
        user.password,
      );

    if (!passwordIsValid) {
      throw new UnauthorizedException(
        AuthMessages.INVALID_CREDENTIALS,
      );
    }

    const accessToken =
      await this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    };
  }
}
