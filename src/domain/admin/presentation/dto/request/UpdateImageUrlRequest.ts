import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateImageUrlRequest {
  @ApiProperty({
    description: '새 이미지 URL (S3 URL)',
    example:
      'https://your-bucket.s3.ap-northeast-2.amazonaws.com/images/uuid.jpg',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  imageUrl: string;
}
