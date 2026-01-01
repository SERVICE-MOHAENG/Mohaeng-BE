import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenRequest {
  @ApiProperty({ description: '리프레시 토큰', example: 'refresh-token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
