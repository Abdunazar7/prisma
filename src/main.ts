import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { WinstonModule } from "nest-winston";
import { winstonConfig } from "./common/logging/winston.logging";
import { AllExceptionsFilter } from "./common/errors/error.handling";

async function start() {
  try {
    const PORT = process.env.PORT ?? 3000;
    const app = await NestFactory.create(AppModule, {
      // logger: false,
      // logger: ["warn", "error"]
      // logger: new ConsoleLogger({
      //   // colors: false,
      //   prefix: "Prismajon",
      //   // json: true,
      //   compact: true,
      // })
      logger: WinstonModule.createLogger(winstonConfig)
    });

    app.useGlobalFilters(new AllExceptionsFilter())
    
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
