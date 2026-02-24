import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ImageErrorCode, ImageErrorMessage } from './code';

/**
 * S3 업로드 중 오류가 발생했을 때 발생하는 예외
 */
export class ImageUploadFailedException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ImageErrorCode.IMAGE_UPLOAD_FAILED,
        ImageErrorMessage[ImageErrorCode.IMAGE_UPLOAD_FAILED],
      ),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
