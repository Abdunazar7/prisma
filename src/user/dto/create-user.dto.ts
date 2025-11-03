import { IsString, IsEmail, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  readonly phone: string;

  @IsString()
  @MinLength(6)
  readonly password: string;

  @IsString()
  @MinLength(6)
  readonly confirm_password: string;
}
