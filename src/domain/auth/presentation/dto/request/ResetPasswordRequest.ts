import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class ResetPasswordRequest {
  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '새 비밀번호 (8-30자, 영문+숫자+특수문자)',
    example: 'NewP@ssw0rd!',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/, {
    message: '비밀번호는 8-30자이며, 영문, 숫자, 특수문자를 포함해야 합니다.',
  })
  password: string;

  @ApiProperty({
    description: '비밀번호 확인',
    example: 'NewP@ssw0rd!',
  })
  @IsString()
  @IsNotEmpty()
  passwordConfirm: string;
}
