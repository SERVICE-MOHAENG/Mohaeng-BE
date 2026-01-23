import { ApiProperty } from '@nestjs/swagger';
import { CoursePlace } from '../../../entity/CoursePlace.entity';

/**
 * CoursePlaceResponse DTO
 * @description
 * - 코스 장소 응답
 */
export class CoursePlaceResponse {
  @ApiProperty({ description: '코스 장소 ID' })
  id: string;

  @ApiProperty({ description: '방문 순서' })
  visitOrder: number;

  @ApiProperty({ description: '여행 일차' })
  dayNumber: number;

  @ApiProperty({ description: '장소 방문 메모', nullable: true })
  memo: string | null;

  @ApiProperty({ description: '장소 ID' })
  placeId: string;

  @ApiProperty({ description: '장소 이름' })
  placeName: string;

  @ApiProperty({ description: '장소 설명', nullable: true })
  placeDescription: string | null;

  @ApiProperty({ description: '장소 이미지 URL', nullable: true })
  placeImageUrl: string | null;

  @ApiProperty({ description: '위도', nullable: true })
  latitude: number | null;

  @ApiProperty({ description: '경도', nullable: true })
  longitude: number | null;

  @ApiProperty({ description: '주소', nullable: true })
  address: string | null;

  @ApiProperty({ description: '영업시간', nullable: true })
  openingHours: string | null;

  @ApiProperty({ description: '장소 카테고리', nullable: true })
  category: string | null;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;

  /**
   * Entity -> DTO 변환
   */
  static fromEntity(coursePlace: CoursePlace): CoursePlaceResponse {
    const response = new CoursePlaceResponse();
    response.id = coursePlace.id;
    response.visitOrder = coursePlace.visitOrder;
    response.dayNumber = coursePlace.dayNumber;
    response.memo = coursePlace.memo;
    response.placeId = coursePlace.place.id;
    response.placeName = coursePlace.place.name;
    response.placeDescription = coursePlace.place.description;
    response.placeImageUrl = coursePlace.place.imageUrl;
    response.latitude = coursePlace.place.latitude;
    response.longitude = coursePlace.place.longitude;
    response.address = coursePlace.place.address;
    response.openingHours = coursePlace.place.openingHours;
    response.category = coursePlace.place.category;
    response.createdAt = coursePlace.createdAt;
    response.updatedAt = coursePlace.updatedAt;
    return response;
  }
}
