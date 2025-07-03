import { ModuleMetadata } from '@nestjs/common';
import { LoggerOptions, LevelWithSilentOrString as PinoLevel } from 'pino';

export { PinoLevel };

export interface PinoOptions extends LoggerOptions {
  callsites: boolean;
  relativeTo?: string;
  stackAdjustment?: number;
}

export interface PinoAsyncParams
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useFactory: (...args: any[]) => PinoOptions | Promise<PinoOptions>;
  inject?: any[];
  global?: boolean;
}
