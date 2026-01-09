import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ExchangeAuthCodeRequest {
  @ApiProperty({
    description: 'OAuth 인증 코드 (일회용, 5분 유효)',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: '디바이스 타입',
    example: 'web',
    enum: ['web', 'ios', 'android'],
  })
  @IsString()
  @IsIn(['web', 'ios', 'android'])
  @IsNotEmpty()
  deviceId: string;
}
