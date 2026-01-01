import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AdminPermission } from '../../domain/admin/entity/AdminPermission.enum';
import { GlobalForbiddenException } from '../exception/GlobalForbiddenException';
import { GlobalInvalidTokenException } from '../exception/GlobalInvalidTokenException';
import { GlobalMissingTokenException } from '../exception/GlobalMissingTokenException';
import { GlobalJwtService, AdminTokenPayload } from '../jwt/GlobalJwtService';
import { ADMIN_PERMISSIONS_KEY } from '../decorators/AdminAuth';

type AuthenticatedAdmin = {
  id: string;
  email: string;
  permissions: number;
  isSuperAdmin: boolean;
};

type AuthenticatedRequest = Request & { admin?: AuthenticatedAdmin };

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly globalJwtService: GlobalJwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;
    // Authorization 헤더 누락 체크
    if (!authHeader) {
      throw new GlobalMissingTokenException();
    }
    const token = this.extractBearerToken(authHeader);
    // Bearer 형식 검증
    if (!token) {
      throw new GlobalInvalidTokenException();
    }

    try {
      // Validate admin token and permissions
      // 관리자 토큰 검증 및 권한 확인
      const payload = this.globalJwtService.verifyAdminToken(token);
      const admin = this.toAuthenticatedAdmin(payload);
      request.admin = admin;

      const requiredPermissions =
        this.reflector.getAllAndOverride<AdminPermission[] | undefined>(
          ADMIN_PERMISSIONS_KEY,
          [context.getHandler(), context.getClass()],
        );

      // 필요한 권한이 있으면 모두 포함되는지 검사
      if (requiredPermissions && !this.hasAllPermissions(admin, requiredPermissions)) {
        throw new GlobalForbiddenException();
      }

      return true;
    } catch (error) {
      if (error instanceof GlobalForbiddenException) {
        throw error;
      }
      throw new GlobalInvalidTokenException();
    }
  }

  private extractBearerToken(authHeader: string): string | undefined {
    const [scheme, token] = authHeader.split(' ');
    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      return undefined;
    }

    return token;
  }

  private toAuthenticatedAdmin(payload: AdminTokenPayload): AuthenticatedAdmin {
    return {
      id: payload.adminId,
      email: payload.email,
      permissions: payload.permissions,
      isSuperAdmin: payload.isSuperAdmin,
    };
  }

  private hasAllPermissions(
    admin: AuthenticatedAdmin,
    requiredPermissions: AdminPermission[],
  ): boolean {
    if (admin.isSuperAdmin) {
      return true;
    }

    return requiredPermissions.every(
      (permission) => (admin.permissions & permission) === permission,
    );
  }
}
