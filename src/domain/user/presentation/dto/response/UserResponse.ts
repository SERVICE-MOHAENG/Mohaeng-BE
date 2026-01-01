import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({ description: '사용자 ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ description: '이름', example: '홍길동' })
  name: string;

  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: '활성 상태', example: true })
  isActivate: boolean;

  @ApiProperty({ description: '생성일', example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  static fromEntity(user: { id: string; name: string; email: string; isActivate: boolean; createdAt: Date }): UserResponse {
    const response = new UserResponse();
    response.id = user.id;
    response.name = user.name;
    response.email = user.email;
    response.isActivate = user.isActivate;
    response.createdAt = user.createdAt;
    return response;
  }
}
