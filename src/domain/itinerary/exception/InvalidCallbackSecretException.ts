import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ItineraryErrorCode } from './code/ItineraryErrorCode';

export class InvalidCallbackSecretException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ItineraryErrorCode.INVALID_CALLBACK_SECRET,
        '유효하지 않은 서비스 인증입니다',
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
