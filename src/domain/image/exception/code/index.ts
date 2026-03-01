export enum ImageErrorCode {
  // 업로드 관련 (U - Upload)
  INVALID_IMAGE_TYPE = 'TRIP_CORE_HE_IMG_U001',
  IMAGE_FILE_TOO_LARGE = 'TRIP_CORE_HE_IMG_U002',
  IMAGE_UPLOAD_FAILED = 'TRIP_CORE_HE_IMG_U003',
}

export const ImageErrorMessage = {
  [ImageErrorCode.INVALID_IMAGE_TYPE]:
    '허용되지 않는 파일 형식입니다. (jpg, jpeg, png, webp만 허용)',
  [ImageErrorCode.IMAGE_FILE_TOO_LARGE]: '파일 크기가 너무 큽니다. (최대 10MB)',
  [ImageErrorCode.IMAGE_UPLOAD_FAILED]: 'S3 파일 업로드에 실패했습니다.',
} as const;
