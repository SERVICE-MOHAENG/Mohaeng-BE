import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './global/logger/Logger.module';
import { GlobalModule } from './global/GlobalModule';
import { AuthModule } from './domain/auth/AuthModule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT') || '3306'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize:
          configService.get('SYNC_AUTO_DDL') === 'true' &&
          configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        timezone: '+09:00',
        charset: 'utf8mb4',
      }),
    }),
    LoggerModule,
    GlobalModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
