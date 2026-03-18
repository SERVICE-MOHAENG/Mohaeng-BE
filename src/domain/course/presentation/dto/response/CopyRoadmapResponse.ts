import { ApiProperty } from '@nestjs/swagger';

export class CopyRoadmapResponse {
  @ApiProperty({ description: '복사된 코스 ID' })
  id: string;

  static of(id: string): CopyRoadmapResponse {
    const response = new CopyRoadmapResponse();
    response.id = id;
    return response;
  }
}
