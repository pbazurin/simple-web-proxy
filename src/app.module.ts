import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProxyController } from './controllers/proxy.controller';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ProxyRepository } from './repositories/proxy.repository';
import { CustomLoggerService } from './services/custom-logger.service';
import { AbsoluteUrlProcessor } from './services/processors/absolute-url.processor';
import { RelativeUrlProcessor } from './services/processors/relative-url.processor';
import { ProxyService } from './services/proxy.service';
import { UtilsService } from './services/utils.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    HttpModule,
  ],
  controllers: [ProxyController],
  providers: [
    CustomLoggerService,
    UtilsService,
    ProxyService,
    ProxyRepository,
    AbsoluteUrlProcessor,
    RelativeUrlProcessor,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
