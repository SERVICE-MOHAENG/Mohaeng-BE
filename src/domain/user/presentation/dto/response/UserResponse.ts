import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({ description: '이름', example: '홍길동' })
  name: string;

  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: '프로필 이미지', example: 'https://cdn.mohaeng.com/profiles/default.png'})
  profileImage: string;

  @ApiProperty({ description: '방문한 국가 수', example: '15'})
  visited_countries: number;

  @ApiProperty({ description: '활성 상태', example: true })
  isActivate: boolean;
  
  static fromEntity(user: {
    id: string;
    name: string;
    email: string;
    profileImage: string;
    visited_countries: number;
    isActivate: boolean;
  }): UserResponse {
    const response = new UserResponse();
    response.name = user.name;
    response.email = user.email;
    response.profileImage = user.profileImage;
    response.visited_countries = user.visited_countries;
    response.isActivate = user.isActivate;
    return response;
  }
}
