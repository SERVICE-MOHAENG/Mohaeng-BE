import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AdminRefreshTokenRequest {
  @ApiProperty({ description: '어드민 리프레시 토큰' })
  @IsString()
  refreshToken: string;
}
