import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CallbackErrorRequest {
  @ApiProperty({ description: '오류 코드', example: 'LLM_PROVIDER_ERROR' })
  @IsString()
  code: string;

  @ApiProperty({ description: '오류 메시지', example: 'Rate limit exceeded' })
  @IsString()
  message: string;
}

class CallbackPlaceRequest {
  @ApiProperty({ description: '장소 이름' })
  @IsString()
  place_name: string;

  @ApiProperty({ description: 'Google Place ID' })
  @IsString()
  place_id: string;

  @ApiProperty({ description: '장소 주소' })
  @IsString()
  address: string;

  @ApiProperty({ description: '위도', example: 35.6595 })
  latitude: number;

  @ApiProperty({ description: '경도', example: 139.7004 })
  longitude: number;

  @ApiProperty({ description: 'Google Maps URL' })
  @IsString()
  place_url: string;

  @ApiProperty({ description: '한 줄 설명' })
  @IsString()
  description: string;

  @ApiProperty({ description: '방문 순서', example: 1 })
  visit_sequence: number;

  @ApiProperty({ description: '방문 시각 (HH:MM)', example: '09:00' })
  @IsString()
  visit_time: string;
}

class CallbackDayRequest {
  @ApiProperty({ description: '여행 일차', example: 1 })
  day_number: number;

  @ApiProperty({ description: '해당 날짜', example: '2026-02-14' })
  @IsString()
  daily_date: string;

  @ApiProperty({ description: '장소 목록', type: [CallbackPlaceRequest] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CallbackPlaceRequest)
  places: CallbackPlaceRequest[];
}

class ModifiedItineraryRequest {
  @ApiProperty({ description: '로드맵 시작일', example: '2026-02-14' })
  @IsString()
  start_date: string;

  @ApiProperty({ description: '로드맵 종료일', example: '2026-02-16' })
  @IsString()
  end_date: string;

  @ApiProperty({ description: '총 여행 일수', example: 3 })
  trip_days: number;

  @ApiProperty({ description: '총 숙박 수', example: 2 })
  nights: number;

  @ApiProperty({ description: '총 인원 수', example: 2 })
  people_count: number;

  @ApiProperty({ description: '여행 태그', type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ description: '여행 제목' })
  @IsString()
  title: string;

  @ApiProperty({ description: '여행 요약' })
  @IsString()
  summary: string;

  @ApiProperty({ description: '일자별 일정', type: [CallbackDayRequest] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CallbackDayRequest)
  itinerary: CallbackDayRequest[];
}

/**
 * ItineraryModificationCallbackRequest
 * @description Python LLM 서버로부터의 수정 콜백 요청 DTO
 */
export class ItineraryModificationCallbackRequest {
  @ApiProperty({
    description: '콜백 상태',
    enum: ['SUCCESS', 'FAILED'],
  })
  @IsIn(['SUCCESS', 'FAILED'])
  status: 'SUCCESS' | 'FAILED';

  @ApiProperty({
    description: 'Intent 분류 결과 (SUCCESS 시)',
    enum: ['SUCCESS', 'ASK_CLARIFICATION', 'GENERAL_CHAT', 'REJECTED'],
    required: false,
  })
  @ValidateIf((o) => o.status === 'SUCCESS')
  @IsOptional()
  @IsIn(['SUCCESS', 'ASK_CLARIFICATION', 'GENERAL_CHAT', 'REJECTED'])
  intent_status?: 'SUCCESS' | 'ASK_CLARIFICATION' | 'GENERAL_CHAT' | 'REJECTED';

  @ApiProperty({
    description: '수정된 로드맵 데이터 (intent_status가 SUCCESS일 때만)',
    required: false,
    type: ModifiedItineraryRequest,
  })
  @ValidateIf((o) => o.intent_status === 'SUCCESS')
  @IsOptional()
  @ValidateNested()
  @Type(() => ModifiedItineraryRequest)
  modified_itinerary?: ModifiedItineraryRequest;

  @ApiProperty({
    description: '사용자 원본 질문',
    example: '1일차 2번째 장소를 카페 말고 미술관으로 바꿔줘',
  })
  @IsString()
  user_query: string;

  @ApiProperty({
    description: 'AI 응답 메시지',
    example: '1일차 2번째 장소를 도쿄 국립 박물관으로 변경했습니다.',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: '변경된 노드 ID 목록 (intent_status가 SUCCESS일 때)',
    type: [String],
    required: false,
  })
  @ValidateIf((o) => o.intent_status === 'SUCCESS')
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  diff_keys?: string[];

  @ApiProperty({
    description: '실패 정보',
    required: false,
    type: CallbackErrorRequest,
  })
  @ValidateIf((o) => o.status === 'FAILED')
  @IsOptional()
  @ValidateNested()
  @Type(() => CallbackErrorRequest)
  error?: CallbackErrorRequest;
}
