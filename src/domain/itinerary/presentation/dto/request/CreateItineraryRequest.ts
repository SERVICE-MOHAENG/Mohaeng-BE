import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateItineraryRequest {
  @ApiProperty({ description: '설문 ID', example: 'uuid-string' })
  @IsUUID()
  @IsNotEmpty()
  surveyId: string;
}
