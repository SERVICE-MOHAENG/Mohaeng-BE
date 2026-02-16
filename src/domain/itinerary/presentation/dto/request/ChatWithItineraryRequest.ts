import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * ChatWithItineraryRequest
 * @description 로드맵 수정 채팅 요청 DTO
 */
export class ChatWithItineraryRequest {
  @ApiProperty({
    description: '사용자 메시지',
    example: '1일차 2번째 장소를 카페 말고 미술관으로 바꿔줘',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;
}
