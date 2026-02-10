import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsDefined,
  IsIn,
  IsNumber,
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
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: '경도', example: 139.7004 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: 'Google Maps URL' })
  @IsString()
  place_url: string;

  @ApiProperty({ description: '한 줄 설명' })
  @IsString()
  description: string;

  @ApiProperty({ description: '방문 순서', example: 1 })
  @IsNumber()
  visit_sequence: number;

  @ApiProperty({ description: '방문 시각 (HH:MM)', example: '09:00' })
  @IsString()
  visit_time: string;
}

class CallbackDayRequest {
  @ApiProperty({ description: '여행 일차', example: 1 })
  @IsNumber()
  day_number: number;

  @ApiProperty({ description: '해당 날짜', example: '2026-02-14' })
  @IsDateString()
  daily_date: string;

  @ApiProperty({ description: '장소 목록', type: [CallbackPlaceRequest] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CallbackPlaceRequest)
  places: CallbackPlaceRequest[];
}

class CallbackSuccessDataRequest {
  @ApiProperty({ description: '로드맵 시작일', example: '2026-02-14' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ description: '로드맵 종료일', example: '2026-02-16' })
  @IsDateString()
  end_date: string;

  @ApiProperty({ description: '총 여행 일수', example: 3 })
  @IsNumber()
  trip_days: number;

  @ApiProperty({ description: '총 숙박 수', example: 2 })
  @IsNumber()
  nights: number;

  @ApiProperty({ description: '총 인원 수', example: 2 })
  @IsNumber()
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

  @ApiProperty({ description: 'LLM 코멘터리' })
  @IsString()
  llm_commentary: string;

  @ApiProperty({ description: '다음 행동 제안', type: [String] })
  @IsArray()
  @IsString({ each: true })
  next_action_suggestion: string[];
}

export class ItineraryCallbackRequest {
  @ApiProperty({ description: '콜백 상태', enum: ['SUCCESS', 'FAILED'] })
  @IsIn(['SUCCESS', 'FAILED'])
  status: 'SUCCESS' | 'FAILED';

  @ApiProperty({
    description: '성공 데이터',
    required: true,
    type: CallbackSuccessDataRequest,
  })
  @ValidateIf((o) => o.status === 'SUCCESS')
  @IsDefined()
  @ValidateNested()
  @Type(() => CallbackSuccessDataRequest)
  data?: CallbackSuccessDataRequest;

  @ApiProperty({
    description: '실패 정보',
    required: true,
    type: CallbackErrorRequest,
  })
  @ValidateIf((o) => o.status === 'FAILED')
  @IsDefined()
  @ValidateNested()
  @Type(() => CallbackErrorRequest)
  error?: CallbackErrorRequest;
}
