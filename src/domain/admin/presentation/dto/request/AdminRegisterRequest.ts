import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminRegisterRequest {
  @ApiProperty({ example: 'admin@example.com', description: '관리자 이메일' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: '비밀번호 (최소 8자)' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: false, description: '슈퍼어드민 여부' })
  @IsBoolean()
  @IsOptional()
  isSuperAdmin?: boolean;
}
