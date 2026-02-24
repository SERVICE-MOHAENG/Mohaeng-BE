import { ApiProperty } from '@nestjs/swagger';

export class ImageUploadResponse {
  @ApiProperty({ description: '업로드된 이미지의 S3 URL' })
  imageUrl: string;

  static from(url: string): ImageUploadResponse {
    const dto = new ImageUploadResponse();
    dto.imageUrl = url;
    return dto;
  }
}
