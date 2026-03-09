import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  timestamp?: string;
}

@Injectable()
export class DiscordService {
  private readonly webhookUrl: string | undefined;

  constructor(private readonly configService: ConfigService) {
    const rawWebhookUrl = this.configService.get<string>('DISCORD_WEBHOOK_URL');
    this.webhookUrl = rawWebhookUrl
      ? rawWebhookUrl.trim().replace(/,+$/, '')
      : undefined;
  }

  /**
   * Discord로 에러 로그 전송
   */
  async sendError(
    message: string,
    context?: string,
    stack?: string,
  ): Promise<void> {
    await this.sendLog('ERROR', message, context, stack);
  }

  /**
   * Discord로 경고 로그 전송
   */
  async sendWarn(message: string, context?: string): Promise<void> {
    await this.sendLog('WARN', message, context);
  }

  /**
   * Discord로 정보 로그 전송 (서버 시작 등)
   */
  async sendInfo(message: string, context?: string): Promise<void> {
    await this.sendLog('INFO', message, context);
  }

  /**
   * Discord 웹훅으로 로그 전송
   */
  private async sendLog(
    level: 'ERROR' | 'WARN' | 'INFO',
    message: string,
    context?: string,
    stack?: string,
  ): Promise<void> {
    if (!this.webhookUrl) {
      return;
    }

    try {
      const embed = this.createEmbed(level, message, context, stack);

      await axios.post(this.webhookUrl, { embeds: [embed] }, { timeout: 5000 });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('[DiscordService] webhook send failed:', errorMessage);
    }
  }

  /**
   * Discord Embed 객체 생성
   */
  private createEmbed(
    level: 'ERROR' | 'WARN' | 'INFO',
    message: string,
    context?: string,
    stack?: string,
  ): DiscordEmbed {
    const config = this.getLogConfig(level);

    const fields = [
      {
        name: 'Context',
        value: context || 'Unknown',
        inline: true,
      },
      {
        name: 'Time',
        value: new Date().toLocaleString('ko-KR', {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        inline: true,
      },
      {
        name: 'Server',
        value: `Mohaeng Core (${this.configService.get<string>('NODE_ENV') || 'development'})`,
        inline: true,
      },
    ];

    if (stack) {
      fields.push({
        name: 'Stack Trace',
        value: `\`\`\`\n${stack.slice(0, 1000)}${stack.length > 1000 ? '\n...(truncated)' : ''}\n\`\`\``,
        inline: false,
      });
    }

    return {
      title: `${config.emoji} ${level} - Mohaeng Core`,
      description: `\`\`\`\n${message.slice(0, 2000)}\n\`\`\``,
      color: config.color,
      fields,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 로그 레벨별 설정 반환
   */
  private getLogConfig(level: 'ERROR' | 'WARN' | 'INFO') {
    const configs = {
      ERROR: {
        emoji: '🚨',
        color: 15158332,
      },
      WARN: {
        emoji: '⚠️',
        color: 16776960,
      },
      INFO: {
        emoji: '💡',
        color: 3447003,
      },
    };

    return configs[level];
  }
}
