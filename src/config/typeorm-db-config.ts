import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmDbConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('db.host'),
      port: this.configService.get<number>('db.port'),
      username: this.configService.get<string>('db.username'),
      password: this.configService.get<string>('db.password'),
      database: this.configService.get<string>('db.database'),
      synchronize: true,
      // ssl: {
      //   rejectUnauthorized: false,
      // },
      ssl : false,
      
      // entities: [
      //   'dist/**/**/**/*.entity{.ts,.js}',
      //   'dist/**/**/*.entity{.ts,.js}',
      // ],
      autoLoadEntities: true,
    };
  }
}
