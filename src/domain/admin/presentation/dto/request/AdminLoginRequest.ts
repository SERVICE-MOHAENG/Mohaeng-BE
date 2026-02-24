import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AdminLoginRequest {
  @ApiProperty({ example: 'admin', description: '관리자 아이디' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'password123', description: '비밀번호' })
  @IsString()
  @MinLength(8)
  password: string;
}
