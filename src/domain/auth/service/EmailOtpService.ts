import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { GlobalExternalServiceErrorException } from '../../../global/exception/GlobalExternalServiceErrorException';

@Injectable()
export class EmailOtpService {
  private readonly transporter: Transporter;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from = this.configService.get<string>('SMTP_FROM') || user;

    if (!host || !port || !user || !pass || !from) {
      throw new Error('SMTP configuration is missing.');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
    this.fromAddress = from;
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: email,
        subject: 'Mohaeng 이메일 인증 코드',
        text: `당신의 인증 코드는 ${otp}입니다. 이 인증 코드는 5분뒤에 만료됩니다`,
      });
    } catch {
      throw new GlobalExternalServiceErrorException();
    }
  }
}
