import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

export interface AdminTokenPayload {
  adminId: string;
  username: string;
  permissions: number;
  isSuperAdmin: boolean;
  iat: number;
  exp: number;
}

export interface AdminRefreshTokenPayload {
  adminId: string;
  jti: string;
  iat: number;
  exp: number;
}

export interface UserTokenPayload {
  sub: string;
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface B2BTokenPayload {
  b2bUserId: string;
  companyId: string;
  email: string;
  companyName: string;
  isRoot: boolean;
  iat: number;
  exp: number;
}

@Injectable()
export class GlobalJwtService {
  private readonly secret: string;
  private readonly expiresIn: string;
  private readonly adminSecret: string;
  private readonly adminExpiresIn: string;
  private readonly adminRefreshSecret: string;
  private readonly adminRefreshExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // User token secrets
    this.secret = this.configService.get<string>('JWT_ACCESS_SECRET') || '';
    this.expiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRY') || '1h';

    // Admin token secrets (User와 분리된 secret 사용)
    this.adminSecret =
      this.configService.get<string>('JWT_ADMIN_ACCESS_SECRET') || '';
    this.adminExpiresIn =
      this.configService.get<string>('JWT_ADMIN_ACCESS_EXPIRY') || '1h';
    this.adminRefreshSecret =
      this.configService.get<string>('JWT_ADMIN_REFRESH_SECRET') || '';
    this.adminRefreshExpiresIn =
      this.configService.get<string>('JWT_ADMIN_REFRESH_EXPIRES_IN') || '7d';

    if (!this.secret) {
      throw new Error('JWT access secret is not set.');
    }
    if (!this.adminSecret) {
      throw new Error('JWT admin access secret is not set.');
    }
    if (!this.adminRefreshSecret) {
      throw new Error('JWT admin refresh secret is not set.');
    }
  }

  signAdminToken(payload: {
    adminId: string;
    username: string;
    permissions: number;
    isSuperAdmin: boolean;
  }): string {
    return this.jwtService.sign(payload, {
      secret: this.adminSecret,
      expiresIn: this.adminExpiresIn as StringValue,
    });
  }

  signAdminRefreshToken(payload: { adminId: string; jti: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.adminRefreshSecret,
      expiresIn: this.adminRefreshExpiresIn as StringValue,
    });
  }

  verifyAdminToken(token: string): AdminTokenPayload {
    const payload = this.jwtService.verify<Partial<AdminTokenPayload>>(token, {
      secret: this.adminSecret,
    });

    if (
      !payload.adminId ||
      payload.permissions === undefined ||
      payload.isSuperAdmin === undefined
    ) {
      throw new Error('Invalid admin token payload.');
    }

    return payload as AdminTokenPayload;
  }

  verifyAdminRefreshToken(token: string): AdminRefreshTokenPayload {
    const payload = this.jwtService.verify<Partial<AdminRefreshTokenPayload>>(
      token,
      { secret: this.adminRefreshSecret },
    );

    if (!payload.adminId || !payload.jti) {
      throw new Error('Invalid admin refresh token payload.');
    }

    return payload as AdminRefreshTokenPayload;
  }

  signUserToken(payload: {
    userId: string;
    email: string;
    sub?: string;
  }): string {
    return this.jwtService.sign(
      {
        sub: payload.sub || payload.userId,
        userId: payload.userId,
        email: payload.email,
      },
      {
        secret: this.secret,
        expiresIn: this.expiresIn as StringValue,
      },
    );
  }

  signToken(
    payload: Record<string, unknown>,
    options?: {
      expiresIn?: string;
      issuer?: string;
      audience?: string;
    },
  ): string {
    return this.jwtService.sign(payload, {
      secret: this.secret,
      expiresIn: (options?.expiresIn || this.expiresIn) as StringValue,
      issuer: options?.issuer,
      audience: options?.audience,
    });
  }

  verifyUserToken(token: string): UserTokenPayload {
    const payload = this.jwtService.verify<Partial<UserTokenPayload>>(token, {
      secret: this.secret,
    });

    if (!payload.userId || !payload.sub) {
      throw new Error('Invalid user token payload.');
    }

    return payload as UserTokenPayload;
  }

  verifyToken<T = unknown>(
    token: string,
    options?: {
      ignoreExpiration?: boolean;
      audience?: string;
      issuer?: string;
    },
  ): T {
    return this.jwtService.verify(token, {
      secret: this.secret,
      ignoreExpiration: options?.ignoreExpiration || false,
      audience: options?.audience,
      issuer: options?.issuer,
    }) as T;
  }

  getTokenExpirationTime(token: string): number {
    try {
      const payload = this.verifyToken<{ exp: number }>(token);
      const now = Math.floor(Date.now() / 1000);
      return payload.exp - now;
    } catch {
      return -1;
    }
  }

  isTokenValid(token: string): boolean {
    try {
      this.verifyToken(token);
      return true;
    } catch {
      return false;
    }
  }

  decodeToken<T = unknown>(token: string): T | undefined {
    try {
      const decoded = this.jwtService.decode<T>(token);
      if (!decoded || typeof decoded === 'string') {
        return undefined;
      }
      return decoded;
    } catch {
      return undefined;
    }
  }

  signB2BAccessToken(payload: {
    b2bUserId: string;
    companyId: string;
    email: string;
    companyName: string;
    isRoot: boolean;
  }): string {
    return this.jwtService.sign(payload, {
      secret: this.secret,
      expiresIn: this.expiresIn as StringValue,
    });
  }

  verifyB2BAccessToken(token: string): B2BTokenPayload {
    const payload = this.jwtService.verify<Partial<B2BTokenPayload>>(token, {
      secret: this.secret,
    });

    if (!payload.b2bUserId || !payload.companyId) {
      throw new Error('Invalid b2b token payload.');
    }

    return payload as B2BTokenPayload;
  }
}
