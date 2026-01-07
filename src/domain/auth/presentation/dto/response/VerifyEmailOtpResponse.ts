import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailOtpResponse {
  @ApiProperty({ description: 'otp verify result' })
  verified: boolean;
}
