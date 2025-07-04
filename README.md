# NestJS Pino module

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
- [Advanced Usage with Direct Pino Access](#advanced-usage-with-direct-pino-access)
- [Integration with NestJS](#integration-with-nestjs)
- [Integration with TypeORM](#integration-with-typeorm)
- [License](#license)

## Installation

```bash
npm install @toxicoder/nestjs-pino
```

## Overview

This module provides a seamless integration of the [Pino](https://getpino.io/) logger into NestJS applications.
Pino is one of the fastest JSON loggers available for Node.js, offering:

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
- TypeORM logger compatibility

## Environment Variables

| Variable      | Type           | Default   | Description                                                                     |
| ------------- | -------------- | --------- | ------------------------------------------------------------------------------- |
| LOG_LEVEL     | string         | 'info'    | Sets the minimum log level ('fatal', 'error', 'warn', 'info', 'debug', 'trace') |
| LOG_JSON      | boolean        | true      | Whether to output logs in JSON format                                           |
| LOG_PRETTY    | boolean        | undefined | Whether to use pretty formatting for logs (only applies when LOG_JSON is false) |
| LOG_COLOR     | boolean        | undefined | Whether to colorize log output (only applies when LOG_JSON is false)            |
| LOG_CALLSITES | boolean        | false     | Whether to include call sites in logs                                           |
| LOG_DB        | string/boolean | undefined | Controls TypeORM logging. Can be a log level or boolean to enable/disable       |

## Usage

### Basic Setup

The simplest way to use the module is with the default configuration:

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
import { PinoModule, PinoOptions } from '@toxicoder/nestjs-pino';
import { ClsModule, ClsService } from 'nestjs-cls';

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
{
  "level": "info",
  "time": "2023-11-15T12:34:56.789Z",
  "message": "Application started",
  "caller": "src/main.ts:15"
}
```

Or in pretty format:

```
[12:34:56.789] INFO (src/main.ts:15): Application started
```

## Advanced Usage with Direct Pino Access

The `pino` instance in `PinoService` is publicly accessible, allowing you to use all
native Pino features directly:

```typescript
import { Injectable } from '@nestjs/common';
import { PinoService } from '@toxicoder/nestjs-pino';

@Injectable()
export class MonitoringService {
  private logger;

  constructor(private readonly pinoService: PinoService) {
    this.logger = this.pinoService.pino.child(
      {
        context: 'MonitoringService',
      },
      {
        customLevels: {
          critical: 60,
          security: 55,
          business: 35,
        },
      },
    );
  }

  monitorSystem() {
    // Use standard levels
    this.logger.info('System check started');

    // Use custom levels
    this.logger.business('Business event occurred');
    this.logger.security('Security event detected');
    this.logger.critical('Critical system failure');
  }
}
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

## Integration with TypeORM

The PinoService implements TypeORM's logger interface, allowing it to be used directly as a TypeORM logger.

### Configuration

You can enable TypeORM logging by setting the `LOG_DB` environment variable or by configuring the `dbLogging` option:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PinoModule, PinoService } from '@toxicoder/nestjs-pino';

@Module({
  imports: [
    PinoModule.forRoot({
      dbLogging: 'debug', // or true to use the same level as the main logger
    }),
    TypeOrmModule.forRootAsync({
      imports: [PinoModule],
      inject: [PinoService],
      useFactory: (logger: PinoService) => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'test',
        entities: [],
        logger, // Use PinoService as TypeORM logger
      }),
    }),
  ],
})
export class AppModule {}
```

### Log Levels

The TypeORM logger uses the following Pino log levels:

- `info`: Migration and schema build logs
- `debug`: Query logs
- `warn`: Slow query logs
- `error`: Query error logs

### Example Output

JSON format:

```json
{"level":"debug","time":"2023-11-15T12:34:56.789Z","context":"typeorm","message":"QUERY: SELECT * FROM users WHERE id = $1 [1]"}
{"level":"error","time":"2023-11-15T12:35:01.234Z","context":"typeorm","message":"ERROR: connection refused\nquery: SELECT * FROM users\nparameters: []"}
```

Pretty format:

```
[12:34:56.789] DEBUG (typeorm): QUERY: SELECT * FROM users WHERE id = $1 [1]
[12:35:01.234] ERROR (typeorm): ERROR: connection refused
    query: SELECT * FROM users
    parameters: []
```

## License

This project is licensed under the ISC License - see the [package.json](package.json) file for details.
