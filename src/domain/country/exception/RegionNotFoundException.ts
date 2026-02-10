import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CountryErrorCode } from './code/CountryErrorCode';

/**
 * 지역을 찾을 수 없을 때 발생하는 예외
 */
export class RegionNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        CountryErrorCode.REGION_NOT_FOUND,
        '지역을 찾을 수 없습니다',
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
