import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { Users } from "@prisma/client";
import { CreateUserDto, SignInUserDto } from "../user/dto";
import { UserService } from "../user/user.service";
import bcrypt from "bcrypt";
import { Response } from "express";
import { JwtPayload, ResponseFields, Tokens } from "../../common/types";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService
  ) {}

  private async genereteTokens(user: Users):Promise<Tokens> {
    const paylod: JwtPayload = {
      id: user.id,
      email: user.email,
      is_active: user.is_active,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(paylod, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME as any,
      }),

      this.jwtService.sign(paylod, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async signup(createUserDto: CreateUserDto) {
    const candidate = await this.prismaService.users.findUnique({
      where: { email: createUserDto.email },
    });
    if (candidate) {
      throw new ConflictException("Bunday foydalanuvchi majud");
    }

    const newUser = await this.userService.create(createUserDto);
    return {
      message: "User created",
      userId: newUser.id,
    };
  }

  async signin(signinUserDto: SignInUserDto, res: Response): Promise<ResponseFields> {
    const user = await this.prismaService.users.findUnique({
      where: { email: signinUserDto.email },
    });
    if (!user) {
      throw new UnauthorizedException("Email yoki parol notog'ri");
    }
    const confirmPassword = await bcrypt.compare(
      signinUserDto.password,
      user.hashedPassword
    );
    if (!confirmPassword) {
      throw new UnauthorizedException("parol yoki email notog'ri");
    }

    const { accessToken, refreshToken } = await this.genereteTokens(user);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 7);
    await this.prismaService.users.update({
      where: { id: user.id },
      data: { hashedRefreshToken },
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: Number(process.env.COOKIE_TIME),
      httpOnly: true,
    });
    return { message: "User signed in", userId: user.id, accessToken };
  }

  async signout(userId: number, res: Response): Promise<boolean> {
    const user = await this.prismaService.users.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: null
      }
    })
    if (!user){
      throw new ForbiddenException("Access denied")
    }
    res.clearCookie("refreshToken");
    return true
  }

  async refreshToken(userId: number, refreshToken: string, res: Response): Promise<ResponseFields> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_KEY,
      });

      if (userId !== decoded.id) {
        throw new ForbiddenException("User ID mismatch");
      }

      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
      });

      if (!user || !user.hashedRefreshToken) {
        throw new ForbiddenException("Access denied");
      }

      const isMatch = await bcrypt.compare(
        refreshToken,
        user.hashedRefreshToken
      );
      if (!isMatch) {
        throw new ForbiddenException("Invalid refresh token");
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await this.genereteTokens(user);

      const hashedNewToken = await bcrypt.hash(newRefreshToken, 7);
      await this.prismaService.users.update({
        where: { id: user.id },
        data: { hashedRefreshToken: hashedNewToken },
      });

      res.cookie("refreshToken", newRefreshToken, {
        maxAge: Number(process.env.COOKIE_TIME),
        httpOnly: true,
      });

      return {
        message: "Access token refreshed",
        userId: user.id,
        accessToken,
      };
    } catch (error) {
      throw new ForbiddenException("Invalid or expired refresh token");
    }
  }
}
