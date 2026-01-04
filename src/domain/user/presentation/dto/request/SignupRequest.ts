import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupRequest {
  @ApiProperty({ description: '이름 (1~20자)', example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  name: string;

  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '비밀번호', example: 'P@ssw0rd!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: '비밀번호 확인', example: 'P@ssw0rd!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  passwordConfirm: string;
}
