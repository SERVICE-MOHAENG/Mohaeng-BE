import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { DiscordService } from './DiscordService';
import { ErrorLogService } from '../../domain/logging/service/ErrorLogService';

@Injectable({ scope: Scope.TRANSIENT })
export class LogInterceptorService implements LoggerService {
  private static discordService: DiscordService | null = null;
  private static errorLogService: ErrorLogService | null = null;
  private context = '';

  static setServices(
    discordService: DiscordService,
    errorLogService: ErrorLogService,
  ) {
    LogInterceptorService.discordService = discordService;
    LogInterceptorService.errorLogService = errorLogService;
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    const logContext = context || this.context;
    console.log(`[LOG] [${logContext}] ${this.formatMessage(message)}`);
  }

  error(message: any, stack?: string, context?: string) {
    const logContext = context || this.context;
    console.error(`[ERROR] [${logContext}] ${this.formatMessage(message)}`);
    if (stack) {
      console.error(stack);
    }

    this.sendToExternalSystems('ERROR', message, logContext, stack);
  }

  warn(message: any, context?: string) {
    const logContext = context || this.context;
    console.warn(`[WARN] [${logContext}] ${this.formatMessage(message)}`);
    this.sendToExternalSystems('WARN', message, logContext);
  }

  debug(message: any, context?: string) {
    const logContext = context || this.context;
    console.debug(`[DEBUG] [${logContext}] ${this.formatMessage(message)}`);
  }

  verbose(message: any, context?: string) {
    const logContext = context || this.context;
    console.log(`[VERBOSE] [${logContext}] ${this.formatMessage(message)}`);
  }

  fatal(message: any, stack?: string, context?: string) {
    const logContext = context || this.context;
    console.error(`[FATAL] [${logContext}] ${this.formatMessage(message)}`);
    if (stack) {
      console.error(stack);
    }

    this.sendToExternalSystems(
      'ERROR',
      `[FATAL] ${this.formatMessage(message)}`,
      logContext,
      stack,
      true,
    );
  }

  private formatMessage(message: any): string {
    if (typeof message === 'string') {
      return message;
    }
    if (message instanceof Error) {
      return message.message;
    }
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }

  private sendToExternalSystems(
    level: 'ERROR' | 'WARN',
    message: any,
    context: string,
    stack?: string,
    immediate = false,
  ) {
    const messageStr = this.formatMessage(message);

    const processLog = async () => {
      try {
        if (LogInterceptorService.discordService) {
          if (level === 'ERROR') {
            await LogInterceptorService.discordService.sendError(
              messageStr,
              context,
              stack,
            );
          } else {
            await LogInterceptorService.discordService.sendWarn(
              messageStr,
              context,
            );
          }
        }

        if (level === 'ERROR' && LogInterceptorService.errorLogService) {
          await this.saveToDatabase(messageStr, context, stack);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          '[LogInterceptor] external logging failed:',
          errorMessage,
        );
      }
    };

    if (immediate) {
      void processLog();
    } else {
      setImmediate(() => {
        void processLog();
      });
    }
  }

  private async saveToDatabase(
    message: string,
    context: string,
    stack?: string,
  ) {
    if (!LogInterceptorService.errorLogService) {
      return;
    }

    try {
      const error = new Error(message);
      if (stack) {
        error.stack = stack;
      }

      await LogInterceptorService.errorLogService.logError({
        endpoint: context,
        method: 'LOG',
        clientIp: 'internal',
        error,
        statusCode: 500,
        userAgent: 'LogInterceptor',
      });
    } catch (dbError) {
      const errorMessage =
        dbError instanceof Error ? dbError.message : String(dbError);
      console.error('[LogInterceptor] DB logging failed:', errorMessage);
    }
  }

  static async sendToExternal(
    level: 'ERROR' | 'WARN',
    message: string,
    context: string,
    stack?: string,
    immediate = false,
  ) {
    if (LogInterceptorService.shouldSkipLogging(context)) {
      return;
    }

    const processLog = async () => {
      try {
        if (LogInterceptorService.discordService) {
          if (level === 'ERROR') {
            await LogInterceptorService.discordService.sendError(
              message,
              context,
              stack,
            );
          } else {
            await LogInterceptorService.discordService.sendWarn(
              message,
              context,
            );
          }
        }

        if (level === 'ERROR' && LogInterceptorService.errorLogService) {
          const error = new Error(message);
          if (stack) {
            error.stack = stack;
          }

          await LogInterceptorService.errorLogService.logError({
            endpoint: context,
            method: 'LOG',
            clientIp: 'internal',
            error,
            statusCode: 500,
            userAgent: 'MonkeyPatch',
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          '[LogInterceptor] external logging failed:',
          errorMessage,
        );
      }
    };

    if (immediate) {
      await processLog();
    } else {
      setImmediate(() => {
        void processLog();
      });
    }
  }

  private static shouldSkipLogging(context: string): boolean {
    const skipContexts = [
      'InstanceLoader',
      'RoutesResolver',
      'RouterExplorer',
      'NestApplication',
      'PackageLoader',
      'ModulesContainer',
    ];

    return skipContexts.some((skip) => context.includes(skip));
  }
}
