import { Injectable } from '@nestjs/common';
import { S3Service } from '../../../global/s3/S3Service';
import { ImageUploadFailedException } from '../exception/ImageUploadFailedException';
import { InvalidImageTypeException } from '../exception/InvalidImageTypeException';

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Image Service
 * @description
 * - 이미지 업로드 비즈니스 로직 처리
 */
@Injectable()
export class ImageService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'images',
  ): Promise<string> {
    if (!file || !ALLOWED_MIMES.includes(file.mimetype)) {
      throw new InvalidImageTypeException();
    }

    try {
      return await this.s3Service.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        folder,
      );
    } catch {
      throw new ImageUploadFailedException();
    }
  }
}
