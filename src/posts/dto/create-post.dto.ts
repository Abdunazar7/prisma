import { IsNumber, IsString } from "class-validator";

export class CreatePostDto {
    @IsString()
    readonly title: string;

    @IsString()
    readonly content: string;

    @IsNumber()
    readonly userId: number;
}
