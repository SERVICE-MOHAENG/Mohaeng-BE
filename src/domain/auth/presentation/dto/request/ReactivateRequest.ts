import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ReactivateRequest {
  @ApiProperty({ description: '복구할 계정 이메일', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
