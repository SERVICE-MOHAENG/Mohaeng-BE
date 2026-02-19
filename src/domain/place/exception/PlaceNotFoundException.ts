import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { PlaceErrorCode, PlaceErrorMessage } from './code';

/**
 * 장소를 찾을 수 없을 때 발생하는 예외
 */
export class PlaceNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        PlaceErrorCode.PLACE_NOT_FOUND,
        PlaceErrorMessage[PlaceErrorCode.PLACE_NOT_FOUND],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
