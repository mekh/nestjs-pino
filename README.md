# @toxicoder/nestjs-pino

A NestJS module for integrating the Pino logger into your NestJS applications.

## Table of Contents

- [Installation](#installation)
- [Overview](#overview)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
  - [Basic Setup](#basic-setup)
  - [Configuration Options](#configuration-options)
  - [Async Configuration](#async-configuration)
- [Log Output Examples](#log-output-examples)
  - [JSON Format](#json-format)
  - [Plain Text Format](#plain-text-format)
  - [With Call Sites](#with-call-sites)
- [Integration with NestJS](#integration-with-nestjs)
- [License](#license)

## Installation

```bash
npm install @toxicoder/nestjs-pino
```

## Overview

This module provides a seamless integration of the [Pino](https://getpino.io/) logger into NestJS applications. Pino is one of the fastest JSON loggers available for Node.js, offering:

- **High Performance**: Extremely fast logging with minimal overhead
- **Structured Logging**: JSON output by default for better log processing
- **Low Overhead**: Minimal impact on your application's performance
- **Flexible Configuration**: Extensive options for customizing log output
- **Pretty Printing**: Human-readable logs during development

The module includes:
- NestJS-compatible logger service
- Environment variable configuration
- Support for call site tracking
- Flexible formatting options

## Environment Variables

| Variable      | Type    | Default   | Description                                                                     |
|---------------|---------|-----------|---------------------------------------------------------------------------------|
| LOG_LEVEL     | string  | 'info'    | Sets the minimum log level ('fatal', 'error', 'warn', 'info', 'debug', 'trace') |
| LOG_JSON      | boolean | true      | Whether to output logs in JSON format                                           |
| LOG_PRETTY    | boolean | undefined | Whether to use pretty formatting for logs (only applies when LOG_JSON is false) |
| LOG_COLOR     | boolean | undefined | Whether to colorize log output (only applies when LOG_JSON is false)            |
| LOG_CALLSITES | boolean | false     | Whether to include call sites in logs                                           |

## Usage

### Basic Setup

The simplest way to use the module is with default configuration:

```typescript
import { Module } from '@nestjs/common';
import { PinoModule } from '@toxicoder/nestjs-pino';

@Module({
  imports: [PinoModule],
})
export class AppModule {}
```

### Configuration Options

You can customize the logger using the `forRoot` method:

```typescript
import { Module } from '@nestjs/common';
import { PinoModule } from '@toxicoder/nestjs-pino';

@Module({
  imports: [
    PinoModule.forRoot({
      level: 'debug',
      callsites: true,
      json: false,
      pretty: true,
      color: true,
    }),
  ],
})
export class AppModule {}
```

### Async Configuration

For dynamic configuration, use the `forRootAsync` method:

```typescript
import { ClsModule, ClsService } from 'nestjs-cls';
import { PinoModule, PinoOptions } from "@toxicoder/nestjs-pino";

import { ConfigModule, LoggerConfig } from '~config';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: uuid,
      },
    }),
    PinoModule.forRootAsync({
      imports: [ConfigModule],
      inject: [LoggerConfig, ClsService],
      useFactory: (config: LoggerConfig, cls: ClsService) => ({
        ...config.getConfig(),
        relativeTo: path.resolve(process.cwd()),
        stackAdjustment: 2,
        mixin: () => ({
          traceId: cls.getId(),
        }),
      }),
    }),
  ],
})
export class AppModule {}
```

## Log Output Examples

### JSON Format

When `LOG_JSON=true` (default), logs are output in JSON format:

```json
{"level":"info","time":"2023-11-15T12:34:56.789Z","message":"Application started"}
{"level":"error","time":"2023-11-15T12:35:01.234Z","message":"Failed to connect to database","error":"Connection refused"}
```

### Plain Text Format

When `LOG_JSON=false` and `LOG_PRETTY=true`, logs are formatted for human readability:

```
[12:34:56.789] INFO: Application started
[12:35:01.234] ERROR: Failed to connect to database
    error: Connection refused
```

### With Call Sites

When `LOG_CALLSITES=true`, logs include the file and line where the log was called:

```json
{"level":"info","time":"2023-11-15T12:34:56.789Z","message":"Application started","caller":"src/main.ts:15"}
```

Or in pretty format:

```
[12:34:56.789] INFO (src/main.ts:15): Application started
```

## Integration with NestJS

To use the logger in your NestJS application's main.ts file:

```typescript
import { NestFactory } from '@nestjs/core';
import { PinoService } from '@toxicoder/nestjs-pino';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs until logger is available
  });

  // Get the PinoService from the application context
  const logger = app.get(PinoService);

  // Set the logger as the application logger
  app.useLogger(logger);

  await app.listen(3000);

  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
```

This setup ensures that all NestJS internal logs (from controllers, services, etc.) will be processed through Pino.

## License

This project is licensed under the ISC License - see the [package.json](package.json) file for details.
