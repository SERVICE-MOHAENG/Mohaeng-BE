import { Body, Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { UserId } from '../../../global/decorators/UserId';
import { UserService } from '../service/UserService';
import { SignupRequest } from './dto/request/SignupRequest';
import { UserResponse } from './dto/response/UserResponse';

/**
 * UserController
 * @description
 * - 사용자 관련 HTTP 요청 처리
 * - 회원가입, 사용자 정보 조회
 */
@ApiTags('users')
@Controller('v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 회원가입
   * @description
   * - 신규 사용자 등록
   * - DTO validation은 글로벌 ValidationPipe에서 처리
   * @param request - 회원가입 요청 DTO
   * @returns 생성된 사용자 정보
   */
  @Post()
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: UserResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 (이메일 중복 등)' })
  async signup(@Body() request: SignupRequest): Promise<UserResponse> {
    const user = await this.userService.signup(request);
    return user;
  }

  @Delete('me')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ status: 204, description: '탈퇴 성공' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(@UserId() userId: string): Promise<void> {
    await this.userService.deactivate(userId);
  }
}
