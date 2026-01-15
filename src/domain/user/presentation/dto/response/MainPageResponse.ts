import { ApiProperty } from "@nestjs/swagger";

export class MainpageResponse{
  @ApiProperty({ 
    description: '사용자 Id', 
    example: '550e8400-e29b-41d4-a716-446655440000', 
  })
  id: string;

  @ApiProperty({ description: '이름', example: '홍길동',})
  name: string;

  @ApiProperty({ description: '이메일', example: 'example@gmail.com'})
  email: string;

  @ApiProperty({ description: '프로필 이미지', example: 'https://cdn.mohaeng.com/profiles/.jpg'})
  profileImage: string | null;

  @ApiProperty({ description: '방문 국가 수', example: '12'})
  visitedCountries: number;

  static fromEntity(user: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
    visitedCountries: number;
  }): MainpageResponse {
    const response = new MainpageResponse();
    response.id = user.id;
    response.name = user.name;
    response.email = user.email;
    response.profileImage = user.profileImage ?? null;
    response.visitedCountries = user.visitedCountries;
    return response;
  }
}