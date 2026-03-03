import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsIn,
  IsArray,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RecommendedDestinationDto {
  @ApiProperty({ description: '추천 여행지명', example: 'BALI' })
  @IsString()
  region_name: string;
}

class PreferenceCallbackDataDto {
  @ApiProperty({
    description: '추천 여행지 목록 (5개)',
    type: [RecommendedDestinationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecommendedDestinationDto)
  recommended_destinations: RecommendedDestinationDto[];
}

class PreferenceCallbackErrorDto {
  @ApiProperty({ example: 'LLM_TIMEOUT' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Analysis took too long to complete.' })
  @IsString()
  message: string;
}

/**
 * PreferenceCallbackRequest DTO
 * @description Python → NestJS 콜백 요청 바디
 */
export class PreferenceCallbackRequest {
  @ApiProperty({ enum: ['SUCCESS', 'FAILED'] })
  @IsIn(['SUCCESS', 'FAILED'])
  status: 'SUCCESS' | 'FAILED';

  @ApiProperty({ required: false, type: PreferenceCallbackDataDto })
  @ValidateIf((o) => o.status === 'SUCCESS')
  @IsDefined()
  @ValidateNested()
  @Type(() => PreferenceCallbackDataDto)
  data?: PreferenceCallbackDataDto;

  @ApiProperty({ required: false, type: PreferenceCallbackErrorDto })
  @ValidateIf((o) => o.status === 'FAILED')
  @IsDefined()
  @ValidateNested()
  @Type(() => PreferenceCallbackErrorDto)
  error?: PreferenceCallbackErrorDto;
}
