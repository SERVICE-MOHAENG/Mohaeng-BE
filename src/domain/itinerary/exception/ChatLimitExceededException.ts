import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ItineraryErrorCode, ItineraryErrorMessage } from './code';

/**
 * ChatLimitExceededException
 * @description 로드맵당 최대 대화 개수(10개)를 초과했을 때 발생하는 예외
 */
export class ChatLimitExceededException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ItineraryErrorCode.CHAT_LIMIT_EXCEEDED,
        ItineraryErrorMessage[ItineraryErrorCode.CHAT_LIMIT_EXCEEDED],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
