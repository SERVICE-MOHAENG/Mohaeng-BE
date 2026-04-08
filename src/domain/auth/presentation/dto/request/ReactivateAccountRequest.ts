import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReactivateAccountRequest {
  @ApiProperty({
    description: '재활성화용 일회성 토큰',
    example: '9f1e10e8f1675bc7c991f72cdd8fbf12c9427ef2b76c89fd5db3439f0da7a8ec',
  })
  @IsString()
  @IsNotEmpty()
  reactivationToken: string;
}
