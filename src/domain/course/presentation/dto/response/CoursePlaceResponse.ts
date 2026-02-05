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

  @ApiProperty({ description: '장소 ID', nullable: true })
  placeId: string | null;

  @ApiProperty({ description: '장소 이름', nullable: true })
  placeName: string | null;

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
   * @description place relation이 로드되지 않은 경우 방어적으로 처리
   */
  static fromEntity(coursePlace: CoursePlace): CoursePlaceResponse {
    const response = new CoursePlaceResponse();
    response.id = coursePlace.id;
    response.visitOrder = coursePlace.visitOrder;
    response.dayNumber = coursePlace.courseDay?.dayNumber ?? 0;
    response.memo = coursePlace.memo;

    const place = coursePlace.place;
    response.placeId = place?.id ?? null;
    response.placeName = place?.name ?? null;
    response.placeDescription = place?.description ?? null;
    response.placeImageUrl = place?.imageUrl ?? null;
    response.latitude = place?.latitude ?? null;
    response.longitude = place?.longitude ?? null;
    response.address = place?.address ?? null;
    response.openingHours = place?.openingHours ?? null;
    response.category = place?.category ?? null;

    response.createdAt = coursePlace.createdAt;
    response.updatedAt = coursePlace.updatedAt;
    return response;
  }
}
