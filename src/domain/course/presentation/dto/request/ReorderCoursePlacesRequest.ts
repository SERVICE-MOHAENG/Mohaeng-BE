import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

/**
 * 코스 장소 순서 변경 요청 DTO
 * @description
 * - 특정 일정(day)의 장소 방문 순서를 변경할 때 사용
 * - placeIds: course_place_id 목록 (변경할 순서대로 전달)
 */
export class ReorderCoursePlacesRequest {
  @ApiProperty({
    description: '장소 ID 목록 (변경할 순서대로 course_place_id를 전달)',
    type: [String],
    example: [
      '123e4567-e89b-12d3-a456-426614174001',
      '123e4567-e89b-12d3-a456-426614174002',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  placeIds: string[];
}
