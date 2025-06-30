import path from 'node:path';
import { LoggerOptions, pino } from 'pino';
import { PrettyOptions } from 'pino-pretty';

import { PinoOptions as Config } from './pino.interfaces';

export class PinoConfig {
  public static create(): Config {
    return new PinoConfig().config;
  }

  private readonly envConfig = {
    level: this.asString('LOG_LEVEL') ?? 'info',
    json: this.asBoolean('LOG_JSON') ?? true,
    pretty: this.asBoolean('LOG_PRETTY'),
    color: this.asBoolean('LOG_COLOR'),
    callSites: this.asBoolean('LOG_CALLSITES') ?? false,
  };

  public get config(): Config {
    return {
      level: this.level,
      formatters: this.formatters,
      transport: this.transport,
      timestamp: this.formatTimestamp.bind(this),
      callsites: this.envConfig.callSites,
      relativeTo: path.resolve(process.cwd()),
    };
  }

  private get level(): string {
    return this.envConfig.level;
  }

  private get colorize(): boolean | undefined {
    return this.envConfig.color;
  }

  private get pretty(): boolean | undefined {
    return this.envConfig.pretty;
  }

  private get formatters(): LoggerOptions['formatters'] {
    return {
      level: this.formatLevel.bind(this),
    };
  }

  private get transport(): LoggerOptions['transport'] {
    if (this.envConfig.json) {
      return undefined;
    }

    const options: PrettyOptions = {
      ...this.pretty !== undefined && { singleLine: !this.pretty },
      ...this.colorize !== undefined && { colorize: this.colorize },
    };

    return { target: 'pino-pretty', options };
  }

  private formatTimestamp(): string {
    return pino.stdTimeFunctions.isoTime();
  }

  private formatLevel(level: string): { level: string } {
    return { level };
  }

  private get env(): Record<string, string | undefined> {
    return process.env;
  }

  private asBoolean(envName: string): boolean | undefined {
    const value = this.asString(envName);

    return value && ['true', 'false'].includes(value)
      ? value === 'true'
      : undefined;
  }

  private asString(envName: string): string | undefined {
    return this.env[envName];
  }
}
