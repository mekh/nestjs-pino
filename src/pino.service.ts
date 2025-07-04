import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Logger, pino } from 'pino';
import { pinoCaller } from 'pino-caller';

import { PINO_CONFIG_TOKEN } from './pino.constants';
import { PinoLevel, PinoOptions } from './pino.interfaces';

type LogFn = (...args: any[]) => void;

@Injectable()
export class PinoService implements LoggerService {
  public readonly pino: Logger;

  public readonly pinoTypeorm: Logger;

  constructor(
    @Inject(PINO_CONFIG_TOKEN) config: PinoOptions,
  ) {
    const { callsites, relativeTo, stackAdjustment, dbLogging, ...options } =
      config;
    const logger = pino(options);

    const callerOptions = {
      ...relativeTo && { relativeTo },
      ...stackAdjustment && { stackAdjustment },
    };

    this.pino = callsites
      ? pinoCaller(logger, callerOptions)
      : logger;

    this.pinoTypeorm = this.pino.child({ context: 'typeorm' }, {
      level: 'silent',
    });

    if (dbLogging) {
      this.pinoTypeorm.level = dbLogging === true
        ? 'info'
        : dbLogging;
    }
  }

  public get level(): PinoLevel {
    return this.pino.level;
  }

  public set level(level: PinoLevel) {
    this.pino.level = level;
  }

  public get fatal(): LogFn {
    return this.pino.fatal.bind(this.pino);
  }

  public get error(): LogFn {
    return this.pino.error.bind(this.pino);
  }

  public get warn(): LogFn {
    return this.pino.warn.bind(this.pino);
  }

  public get log(): LogFn {
    return this.pino.info.bind(this.pino);
  }

  public get info(): LogFn {
    return this.pino.info.bind(this.pino);
  }

  public get debug(): LogFn {
    return this.pino.debug.bind(this.pino);
  }

  public get verbose(): LogFn {
    return this.pino.trace.bind(this.pino);
  }

  public get trace(): LogFn {
    return this.pino.trace.bind(this.pino);
  }

  public logMigration(message: string): void {
    this.pinoTypeorm.info('MIGRATION: %s', message);
  }

  public logQuery(query: string, parameters: any[] = []): void {
    this.pinoTypeorm.info('QUERY: %s %o', query, parameters);
  }

  public logQueryError(
    error: string | Error,
    query: string,
    parameters: any[] = [],
  ): void {
    this.pinoTypeorm.error(
      'ERROR: %o\nquery: %s\nparameters: %o',
      error,
      query,
      parameters,
    );
  }

  public logQuerySlow(
    time: number,
    query: string,
    parameters: any[] = [],
  ): void {
    this.pinoTypeorm.warn(
      'SLOW_QUERY (%dms): %s %o',
      time,
      query,
      parameters,
    );
  }

  public logSchemaBuild(message: string): void {
    this.pinoTypeorm.info('BUILD_SCHEMA: %s', message);
  }
}
