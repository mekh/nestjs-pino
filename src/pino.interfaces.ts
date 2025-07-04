import { ModuleMetadata } from '@nestjs/common';
import { LevelWithSilentOrString as PinoLevel, LoggerOptions } from 'pino';

export { PinoLevel };

export interface PinoOptions extends LoggerOptions {
  callsites: boolean;
  relativeTo?: string;
  stackAdjustment?: number;
  dbLogging?: PinoLevel | boolean;
}

export interface PinoAsyncParams
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useFactory: (...args: any[]) => PinoOptions | Promise<PinoOptions>;
  inject?: any[];
  global?: boolean;
}
