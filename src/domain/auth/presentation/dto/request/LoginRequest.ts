import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequest {
  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '비밀번호', example: 'P@ssw0rd!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: '디바이스 플랫폼 타입 (web, iOS, Android)',
    example: 'web',
    enum: ['web', 'ios', 'android'],
  })
  @IsString()
  @IsIn(['web', 'ios', 'android'])
  @IsNotEmpty()
  deviceType: string;
}
