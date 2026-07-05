import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const conf = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  if (conf.get('APP_ENV') === 'development') {
    const config = new DocumentBuilder()
      .setTitle('FPT API')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('doc', app, document, { useGlobalPrefix: true });
  }

  await app.listen(conf.getOrThrow<number>('HTTP_SERVER_PORT'));
}

bootstrap();
