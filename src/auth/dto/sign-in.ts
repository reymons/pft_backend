import { UserRes } from "@/users/dto/user";
import { UserModel } from "@/users/users.model";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SignInReq {
    @ApiProperty({
        example: "babushka",
        description: "User's name",
    })
    @IsString()
    name: string;

    @ApiProperty({ description: "User's password" })
    @IsString()
    password: string;
}

export class SignInRes {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    accessTokenTTL: number;

    @ApiProperty()
    user: UserRes;

    constructor(at: string, atTTL: number, user: UserModel) {
        this.accessToken = at;
        this.accessTokenTTL = atTTL;
        this.user = new UserRes(user);
    }
}
