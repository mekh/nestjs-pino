import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Logger, pino } from 'pino';
import { pinoCaller } from 'pino-caller';

import { PINO_CONFIG_TOKEN } from './pino.constants';
import { PinoOptions } from './pino.interfaces';

type LogFn = (...args: any[]) => void;

@Injectable()
export class PinoService implements LoggerService {
  private readonly logger: Logger;

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

    this.logger = callsites
      ? pinoCaller(logger, callerOptions)
      : logger;
  }

  public get fatal(): LogFn {
    return this.logger.fatal.bind(this.logger);
  }

  public get error(): LogFn {
    return this.logger.error.bind(this.logger);
  }

  public get warn(): LogFn {
    return this.logger.warn.bind(this.logger);
  }

  public get log(): LogFn {
    return this.logger.info.bind(this.logger);
  }

  public get info(): LogFn {
    return this.logger.info.bind(this.logger);
  }

  public get debug(): LogFn {
    return this.logger.debug.bind(this.logger);
  }

  public get verbose(): LogFn {
    return this.logger.trace.bind(this.logger);
  }

  public get trace(): LogFn {
    return this.logger.trace.bind(this.logger);
  }
}
