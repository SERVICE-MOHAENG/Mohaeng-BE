import { ApiProperty } from '@nestjs/swagger';

export class CurrentUserResponse {
  @ApiProperty({
    description: '사용자 ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  email: string;
}
