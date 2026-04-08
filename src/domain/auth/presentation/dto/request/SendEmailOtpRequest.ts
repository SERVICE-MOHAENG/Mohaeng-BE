import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { AuthEmailOtpPurpose } from './AuthEmailOtpPurpose.enum';

export class SendEmailOtpRequest {
  @ApiProperty({ description: 'user email', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'OTP 사용 목적',
    enum: AuthEmailOtpPurpose,
    example: AuthEmailOtpPurpose.SIGNUP,
    required: false,
    default: AuthEmailOtpPurpose.SIGNUP,
  })
  @IsOptional()
  @IsEnum(AuthEmailOtpPurpose)
  purpose?: AuthEmailOtpPurpose;
}
