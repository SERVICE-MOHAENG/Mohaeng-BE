import { ApiProperty } from '@nestjs/swagger';

export class AdminAuthTokensResponse {
  @ApiProperty({ description: '어드민 액세스 토큰' })
  accessToken: string;

  @ApiProperty({ description: '어드민 리프레시 토큰' })
  refreshToken: string;
}
