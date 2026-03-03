import { ApiProperty } from '@nestjs/swagger';

export class SendEmailOtpResponse {
  @ApiProperty({ description: 'otp send result' })
  sent: boolean;

  @ApiProperty({ description: '계정 활성화 여부 (false면 계정 복구 흐름으로 안내)' })
  isActivate: boolean;
}
