import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendEmailOtpRequest {
  @ApiProperty({ description: 'user email', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
