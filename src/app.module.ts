import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProxyController } from './proxy.controller';
import { ProxyRepository } from './proxy.repository';
import { ProxyService } from './proxy.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    HttpModule,
  ],
  controllers: [ProxyController],
  providers: [ProxyService, ProxyRepository],
})
export class AppModule {}
