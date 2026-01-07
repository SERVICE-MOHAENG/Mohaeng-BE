import { ApiProperty } from '@nestjs/swagger';

export class SendEmailOtpResponse {
  @ApiProperty({ description: 'otp send result' })
  sent: boolean;
}
