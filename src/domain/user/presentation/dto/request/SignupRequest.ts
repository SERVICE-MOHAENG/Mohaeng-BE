import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
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

  @ApiProperty({
    description: '비밀번호 (8~30자, 영문, 숫자, 특수문자 포함)',
    example: 'P@ssw0rd!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(30)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/, {
    message:
      '비밀번호는 8~30자의 영문, 숫자, 특수문자(@$!%*#?&)를 모두 포함해야 합니다.',
  })
  password: string;

  @ApiProperty({
    description: '비밀번호 확인 (8~30자, 영문, 숫자, 특수문자 포함)',
    example: 'P@ssw0rd!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(30)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/, {
    message:
      '비밀번호는 8~30자의 영문, 숫자, 특수문자(@$!%*#?&)를 모두 포함해야 합니다.',
  })
  passwordConfirm: string;
}
