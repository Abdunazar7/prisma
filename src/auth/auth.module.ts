import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "../prisma/prisma.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [JwtModule.register({ global: true }), PrismaModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
