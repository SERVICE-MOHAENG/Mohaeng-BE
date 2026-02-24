import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminLoginRequest {
  @ApiProperty({ example: 'admin@example.com', description: '관리자 이메일' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: '비밀번호' })
  @IsString()
  @MinLength(8)
  password: string;
}
