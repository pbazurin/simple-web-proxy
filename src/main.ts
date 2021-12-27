import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { CustomLoggerService } from './services/custom-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(compression());
  app.useLogger(new CustomLoggerService());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
