import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { SignInRes } from "./sign-in";

export class SignUpReq {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    password: string;
}

export class SignUpRes extends SignInRes {}
