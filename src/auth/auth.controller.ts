import { Body, Controller, Post } from "@nestjs/common";
import { JwtService } from "@/jwt/jwt.service";
import { AuthService } from "./auth.service";
import { SignInReq, SignInRes } from "./dto/sign-in";
import { SignUpReq, SignUpRes } from "./dto/sign-up";
import { ApiCreatedResponse } from "@nestjs/swagger";

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
    ) {}

    @Post("sign-in")
    @ApiCreatedResponse({ type: SignInRes })
    async signIn(@Body() body: SignInReq): Promise<SignInRes> {
        const user = await this.authService.signIn(body.name, body.password);
        const token = await this.jwtService.createAccessToken(user.id);
        return new SignInRes(token, this.jwtService.TOKEN_TTL, user);
    }

    @Post("sign-up")
    @ApiCreatedResponse({ type: SignUpRes })
    async signUp(@Body() body: SignUpReq): Promise<SignUpRes> {
        const user = await this.authService.signUp(body.name, body.password);
        const token = await this.jwtService.createAccessToken(user.id);
        return new SignUpRes(token, this.jwtService.TOKEN_TTL, user);
    }
}
