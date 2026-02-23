import { ApiProperty } from '@nestjs/swagger';

export class CreateSurveyResponse {
  @ApiProperty({ description: '생성된 설문 ID' })
  surveyId: string;

  static from(surveyId: string): CreateSurveyResponse {
    const response = new CreateSurveyResponse();
    response.surveyId = surveyId;
    return response;
  }
}
