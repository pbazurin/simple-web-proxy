import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProxyController } from './controllers/proxy.controller';
import { ProxyRepository } from './repositories/proxy.repository';
import { CustomLoggerService } from './services/custom-logger.service';
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
  providers: [CustomLoggerService, UtilsService, ProxyService, ProxyRepository],
})
export class AppModule {}
