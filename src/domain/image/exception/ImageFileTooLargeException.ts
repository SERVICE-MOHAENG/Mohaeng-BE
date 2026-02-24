import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ImageErrorCode, ImageErrorMessage } from './code';

/**
 * 이미지 파일 크기가 초과되었을 때 발생하는 예외
 */
export class ImageFileTooLargeException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ImageErrorCode.IMAGE_FILE_TOO_LARGE,
        ImageErrorMessage[ImageErrorCode.IMAGE_FILE_TOO_LARGE],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
