import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from '../../../../user/presentation/dto/response/UserResponse';

export class SignupResponse {
  @ApiProperty({ type: UserResponse })
  user: UserResponse;

  @ApiProperty({
    description: '액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: '리프레시 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}
