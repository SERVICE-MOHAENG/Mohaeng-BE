import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CountryErrorCode } from './code/CountryErrorCode';

/**
 * 지역에 연결된 장소가 있어 삭제할 수 없을 때 발생하는 예외
 */
export class RegionHasPlacesException extends HttpException {
  constructor(placeCount: number) {
    super(
      ApiResponseDto.error(
        CountryErrorCode.REGION_HAS_PLACES,
        `이 지역에 ${placeCount}개의 장소가 연결되어 있어 삭제할 수 없습니다`,
      ),
      HttpStatus.CONFLICT,
    );
  }
}
