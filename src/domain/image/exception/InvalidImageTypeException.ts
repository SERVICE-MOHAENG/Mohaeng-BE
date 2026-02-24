import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ImageErrorCode, ImageErrorMessage } from './code';

/**
 * 허용되지 않는 이미지 파일 형식일 때 발생하는 예외
 */
export class InvalidImageTypeException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ImageErrorCode.INVALID_IMAGE_TYPE,
        ImageErrorMessage[ImageErrorCode.INVALID_IMAGE_TYPE],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
