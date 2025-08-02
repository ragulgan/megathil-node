import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as cors from 'cors';
import express from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new Logger() });
  app.useGlobalPipes(new ValidationPipe());
  app.use(cors());
  const config = new DocumentBuilder()
    .setTitle('Nest Megathil')
    .setDescription('The Megathil API description')
    .setVersion('1.0')
    .addBearerAuth({
      name: 'Authorization',
      type: 'apiKey',
      in: 'header',
      description: 'JWT authorization of an API',
    })
    .addServer(`${process.env.SWAGGER_BASEPATH}`)
    .build();
  // app.use('/megathil/assets/', express.static('uploads'))
  const document = SwaggerModule.createDocument(app, config);
  document.security = [{ bearerAuth: [] }];
  const loginEndpoint = document.paths['/auth/login'];
  if (loginEndpoint) {
    loginEndpoint.post.security = [];
  }
  SwaggerModule.setup('/api-docs', app, document);
  app.setGlobalPrefix(process.env.BASE_PATH);
  const port = process.env.PORT || 3000;
  const host = '192.168.0.138';
  // await app.listen(port, host);
  await app.listen(port);

}
bootstrap();
