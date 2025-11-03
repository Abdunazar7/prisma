import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";

async function start() {
  try {
    const PORT = process.env.PORT ?? 3000;
    const app = await NestFactory.create(AppModule, {
      logger: ["error", "warn"],
    });
    app.use(cookieParser());
    app.setGlobalPrefix("api");
    app.useGlobalPipes(new ValidationPipe());

    const config = new DocumentBuilder()
      .setTitle("Prisma-Passport Project")
      .setDescription("The Prisma APIT description")
      .setVersion("1.0")
      .addTag(
        "Nest, access and refresh tokens, cookies, Prisma, passport, decorator"
      )
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, documentFactory);
    await app.listen(PORT, () => {
      console.log(`Server start at: http://localhost:${PORT}/api`);
      console.log(`Server start at: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.log(error);
  }
}
start();
