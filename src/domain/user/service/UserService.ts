import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../entity/User.entity';
import { EmailAlreadyExistsException } from '../exception/EmailAlreadyExistsException';
import { PasswordMismatchException } from '../exception/PasswordMismatchException';
import { UserNotFoundException } from '../exception/UserNotFoundException';
import { UserRepository } from '../persistence/UserRepository';
import { SignupRequest } from '../presentation/dto/request/SignupRequest';
import { UpdateProfileRequest } from '../presentation/dto/request/UpdateProfileRequest';
import { UserResponse } from '../presentation/dto/response/UserResponse';
import { GlobalRedisService } from '../../../global/redis/GlobalRedisService';
import { AuthEmailNotVerifiedException } from '../../auth/exception/AuthEmailNotVerifiedException';
import { MainpageResponse } from '../presentation/dto/response/MainPageResponse';

const SALT_ROUNDS = 11;

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly redisService: GlobalRedisService,
  ) {}

  async signup(request: SignupRequest): Promise<UserResponse> {
    // 이메일 인증 확인
    const normalizedEmail = request.email.trim().toLowerCase();
    const verifiedKey = `auth:email-verified:${normalizedEmail}`;
    const isVerified = await this.redisService.get(verifiedKey);

    //이메일 인증 확인
    if (!isVerified) {
      throw new AuthEmailNotVerifiedException();
    }

    // 이메일 중복 방지
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new EmailAlreadyExistsException();
    }

    // 비밀번호 확인 일치 검증
    if (request.password !== request.passwordConfirm) {
      throw new PasswordMismatchException();
    }

    // 비밀번호 해싱 후 user 저장
    const hashedPassword = await this.hashPassword(request.password);
    const user = User.create(request.name, request.email, hashedPassword);
    const savedUser = await this.userRepository.save(user);

    // 인증 완료 플래그 삭제 (일회용)
    await this.redisService.delete(verifiedKey);

    return UserResponse.fromEntity(savedUser);
  }

  async deactivate(userId: string): Promise<void> {
    // 사용자 존재 확인 후 소프트 삭제
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }
    await this.userRepository.softDelete(userId);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  async getMainpageUser(userId: string): Promise<MainpageResponse>{
    const user = await this.userRepository.findById(userId);
    if(!user){
      throw new UserNotFoundException();
    }
    return MainpageResponse.fromEntity(user);
  }

  async updateProfile(userId: string, request: UpdateProfileRequest): Promise<UserResponse> {
    // 사용자 존재 확인
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    // 비밀번호 확인 일치 검증 (둘 다 제공되어야 함)
    if (request.password !== undefined || request.passwordConfirm !== undefined) {
      if (request.password !== request.passwordConfirm ||
          request.password === undefined ||
          request.passwordConfirm === undefined) {
        throw new PasswordMismatchException();
      }
    }

    // 제공된 필드만 업데이트
    if (request.name !== undefined) {
      user.name = request.name;
    }

    if (request.profileImage !== undefined) {
      user.profileImage = request.profileImage;
    }

    if (request.password !== undefined) {
      const hashedPassword = await this.hashPassword(request.password);
      user.passwordHash = hashedPassword;
    }

    // 저장 및 응답 반환
    const updatedUser = await this.userRepository.save(user);
    return UserResponse.fromEntity(updatedUser);
  }

}
