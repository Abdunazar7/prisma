import { PartialType } from "@nestjs/swagger";
import { CreatePostDto } from "./create-post.dto";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  readonly title?: string;

  @IsOptional()
  @IsString()
  readonly content?: string;

  @IsOptional()
  @IsNumber()
  readonly userId?: number;
}
