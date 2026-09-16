import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports : [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports : [UserService]
})
export class UserModule {}
