import { ApiProperty } from '@nestjs/swagger';
import { ItineraryStatus } from '../../../entity/ItineraryStatus.enum';

export class CreateSurveyResponse {
  @ApiProperty({ description: '생성된 설문 ID' })
  surveyId: string;

  @ApiProperty({ description: '작업 ID (polling에 사용)' })
  jobId: string;

  @ApiProperty({ description: '작업 상태', enum: ItineraryStatus })
  status: ItineraryStatus;

  static from(
    surveyId: string,
    jobId: string,
    status: ItineraryStatus,
  ): CreateSurveyResponse {
    const response = new CreateSurveyResponse();
    response.surveyId = surveyId;
    response.jobId = jobId;
    response.status = status;
    return response;
  }
}
