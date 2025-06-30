import { DynamicModule, Global, Module } from '@nestjs/common';

import { PinoConfig } from './pino.config';
import { PINO_CONFIG_TOKEN } from './pino.constants';
import { PinoAsyncParams, PinoOptions } from './pino.interfaces';
import { PinoService } from './pino.service';

@Global()
@Module({
  providers: [
    {
      provide: PINO_CONFIG_TOKEN,
      useValue: PinoConfig.create(),
    },
    PinoService,
  ],
  exports: [PinoService],
})
export class PinoModule {
  public static forRoot(options: PinoOptions): DynamicModule {
    return {
      module: PinoModule,
      providers: [
        {
          provide: PINO_CONFIG_TOKEN,
          useValue: options,
        },
        PinoService,
      ],
      exports: [PinoService],
    };
  }

  public static forRootAsync(params: PinoAsyncParams): DynamicModule {
    const configProvider = {
      provide: PINO_CONFIG_TOKEN,
      useFactory: params.useFactory,
      inject: params.inject,
    };

    return {
      module: PinoModule,
      global: params.global,
      imports: params.imports,
      providers: [
        ...params.providers ?? [],
        configProvider,
        PinoService,
      ],
      exports: [PinoService],
    };
  }
}
