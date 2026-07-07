import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import FastifyCookie from "@fastify/cookie";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    const conf = app.get(ConfigService);

    await app.register(FastifyCookie);
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
        new ValidationPipe({
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    if (conf.get("APP_ENV") === "dev") {
        const config = new DocumentBuilder()
            .setTitle("PFT API")
            .setVersion("1.0")
            .addBearerAuth(
                {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Enter JWT token",
                },
                "JWT",
            )
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup("doc", app, document, { useGlobalPrefix: true });
    }

    await app.listen(conf.getOrThrow<number>("HTTP_SERVER_PORT"));
}

bootstrap();
