import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { VisitedCountryErrorCode } from './code/VisitedCountryErrorCode';

/**
 * 방문 국가를 찾을 수 없을 때 발생하는 예외
 */
export class VisitedCountryNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        VisitedCountryErrorCode.VISITED_COUNTRY_NOT_FOUND,
        '방문 국가를 찾을 수 없습니다',
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
