import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Logger, pino } from 'pino';
import { pinoCaller } from 'pino-caller';

import { PINO_CONFIG_TOKEN } from './pino.constants';
import { PinoLevel, PinoOptions } from './pino.interfaces';

type LogFn = (...args: any[]) => void;

@Injectable()
export class PinoService implements LoggerService {
  public readonly pino: Logger;

  constructor(
    @Inject(PINO_CONFIG_TOKEN) config: PinoOptions,
  ) {
    const { callsites, relativeTo, stackAdjustment, ...options } =
      config;
    const logger = pino(options);

    const callerOptions = {
      ...relativeTo && { relativeTo },
      ...stackAdjustment && { stackAdjustment },
    };

    this.pino = callsites
      ? pinoCaller(logger, callerOptions)
      : logger;
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
}
