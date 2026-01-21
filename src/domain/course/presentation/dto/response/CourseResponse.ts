import { ApiProperty } from '@nestjs/swagger';
import { TravelCourse } from '../../../entity/TravelCourse.entity';

/**
 * CourseResponse DTO
 * @description
 * - 여행 코스 응답
 */
export class CourseResponse {
  @ApiProperty({ description: '코스 ID' })
  id: string;

  @ApiProperty({ description: '코스 제목' })
  title: string;

  @ApiProperty({ description: '코스 설명', nullable: true })
  description: string | null;

  @ApiProperty({ description: '숙박 일수 (몇 박)' })
  nights: number;

  @ApiProperty({ description: '여행 일수 (몇 일)' })
  days: number;

  @ApiProperty({ description: '공개 여부' })
  isPublic: boolean;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;

  /**
   * Entity -> DTO 변환
   */
  static fromEntity(course: TravelCourse): CourseResponse {
    const response = new CourseResponse();
    response.id = course.id;
    response.title = course.title;
    response.description = course.description;
    response.nights = course.nights;
    response.days = course.days;
    response.isPublic = course.isPublic;
    response.createdAt = course.createdAt;
    response.updatedAt = course.updatedAt;
    return response;
  }
}
