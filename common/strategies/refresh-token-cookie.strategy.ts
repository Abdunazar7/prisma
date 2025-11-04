import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, JwtFromRequestFunction, Strategy } from "passport-jwt";
import { JwtPayload, JwtPayloadWithRefreshToken } from "../types";
import { Request } from "express";

export const cookieExtractor: JwtFromRequestFunction = (req: Request) => {
  // console.log(req.cookies)
  if (req && req.cookies) {
    return req.cookies["refreshToken"];
  }
  return null;
};

@Injectable()
export class RefreshTokenCookieStrategy extends PassportStrategy(
  Strategy, // qaysi Strategy
  "refresh-jwt"
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.REFRESH_TOKEN_KEY!,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRefreshToken {
    const refreshToken = req.cookies.refreshToken;
    console.log("request", req);
    console.log("payload", payload);
    // req.user = payload
    return { ...payload, refreshToken };
  }
}
