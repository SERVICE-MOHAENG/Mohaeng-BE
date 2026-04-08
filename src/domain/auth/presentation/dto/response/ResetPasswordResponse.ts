import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordResponse {
  @ApiProperty({ description: '비밀번호 재설정 결과' })
  reset: boolean;
}
