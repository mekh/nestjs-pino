import { ModuleMetadata } from '@nestjs/common';
import { LoggerOptions } from 'pino';

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
