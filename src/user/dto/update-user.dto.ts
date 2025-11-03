import { IsOptional, IsString, IsEmail, MinLength } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsString()
  readonly phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  readonly password?: string;
}
