import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = unknown> {
  @ApiProperty({ description: '성공 여부' })
  success: boolean;

  @ApiProperty({ description: '에러 코드 (에러 시)' })
  errorCode?: string;

  @ApiProperty({ description: '메시지' })
  message?: string;

  @ApiProperty({ description: '응답 데이터' })
  data?: T;

  constructor(
    success: boolean,
    errorCode?: string,
    message?: string,
    data?: T,
  ) {
    this.success = success;
    this.errorCode = errorCode;
    this.message = message;
    this.data = data;
  }

  static success<T>(data?: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto<T>(true, undefined, message, data);
  }

  static error(errorCode: string, message: string): ApiResponseDto<never> {
    return new ApiResponseDto(false, errorCode, message);
  }
}
