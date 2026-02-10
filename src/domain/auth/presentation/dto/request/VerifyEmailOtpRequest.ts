import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class VerifyEmailOtpRequest {
  @ApiProperty({ description: 'user email', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '6-digit otp', example: '123456' })
  @Matches(/^\d{6}$/)
  @IsNotEmpty()
  otp: string;
}
