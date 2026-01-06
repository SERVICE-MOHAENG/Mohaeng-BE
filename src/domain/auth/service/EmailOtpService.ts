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
    const from = this.configService.get<string>('SMTP_FROM') ?? user;

    if (!host || !port || !user || !pass || !from) {
      throw new Error('SMTP configuration is missing.');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    this.fromAddress = from;
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    try {
      const html = this.buildHtml(otp);
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: email,
        subject: 'Mohaeng 이메일 인증 코드',
        text: `당신의 인증 코드는 ${otp}입니다. 이 코드는 5분동안 유효합니다.`,
        html,
      });
    } catch {
      throw new GlobalExternalServiceErrorException();
    }
  }

  private buildHtml(otp: string): string {
    const otpBoxes = otp
      .split('')
      .map(
        (digit) =>
          `<td style="width:48px;height:56px;border:1px solid #e4e7ec;border-radius:10px;font-size:26px;font-weight:700;background:#f9fafb;text-align:center;vertical-align:middle;">${digit}</td>`,
      )
      .join('');

    return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mohaeng 이메일 인증</title>
</head>
<body style="margin:0;padding:0;background:#f6f7fb;font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:32px 20px 48px;">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;box-shadow:0 12px 24px rgba(16,24,40,0.08);">
          <tr>
            <td style="padding:28px;">
              <h1 style="font-size:20px;margin:0 0 8px;">이메일 인증</h1>
              <p style="font-size:14px;color:#667085;margin:0 0 24px;">아래 인증 코드를 입력해 인증을 완료하세요.</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:22px 0 26px;">
                    <table cellpadding="0" cellspacing="4" border="0">
                      <tr>
                        ${otpBoxes}
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="font-size:13px;color:#475467;margin:0;">이 코드는 5분 유효합니다.</p>
              <p style="margin-top:10px;font-size:13px;color:#12b76a;">5분 후 만료됩니다.</p>
              <p style="margin-top:24px;font-size:12px;color:#98a2b3;">요청하지 않았다면 이 이메일을 무시하세요.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}