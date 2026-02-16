import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { VisitedCountryErrorCode, VisitedCountryErrorMessage } from './code';

/**
 * 방문 국가를 찾을 수 없을 때 발생하는 예외
 */
export class VisitedCountryNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        VisitedCountryErrorCode.VISITED_COUNTRY_NOT_FOUND,
        VisitedCountryErrorMessage[
          VisitedCountryErrorCode.VISITED_COUNTRY_NOT_FOUND
        ],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
