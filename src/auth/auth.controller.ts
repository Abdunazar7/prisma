import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { UpdateAuthDto } from "./dto/update-auth.dto";
import { CreateUserDto, SignInUserDto } from "../user/dto";
import type { Response } from "express";
import { CookieGetter } from "../common/decorators/cookie-getter.decorat";
import { RefreshTokenGuard } from "../common/guards";
import { GetCurrentUser, GetCurrentUserId } from "../common/decorators";
import { JwtPayloadWithRefreshToken, ResponseFields } from "../common/types";
import { use } from "passport";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post("signin")
  async signin(
    @Body() signInUserDto: SignInUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signin(signInUserDto, res);
  }

  @UseGuards(RefreshTokenGuard)
  @Post("signout")
  @HttpCode(HttpStatus.OK)
  async signout(
    @GetCurrentUserId() userId: number,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signout(+userId, res);
  }

  // @Post("signout")
  // @HttpCode(HttpStatus.OK)
  // async signout(
  //   @CookieGetter("refreshToken") refreshToken: string,
  //   @Res({ passthrough: true }) res: Response
  // ) {
  //   return this.authService.signout(refreshToken, res);
  // }

  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser("refreshToken") refreshToken: string,
    // @GetCurrentUser() user: JwtPayloadWithRefreshToken,
    @Res({ passthrough: true }) res: Response
  ): Promise<ResponseFields> {
    // console.log("user - ", user): // O'quv maqsadida
    return this.authService.refreshToken(+userId, refreshToken, res);
  }

  // @Post(":id/refresh")
  // refresh(
  //   @Param("id", ParseIntPipe) id: number,
  //   @CookieGetter("refreshToken") refreshToken: string,
  //   @Res({ passthrough: true }) res: Response
  // ) {
  //   return this.authService.refreshToken(id, refreshToken, res);
  // }
}
