import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { SignInRes } from "./sign-in";
import { Currency } from "@/currency/currency.model";

export class SignUpReq {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    password: string;

    @ApiProperty({ enum: Currency })
    @IsEnum(Currency)
    defaultCurrency: Currency;
}

export class SignUpRes extends SignInRes {}
