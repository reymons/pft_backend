import { Auth } from "@/auth/auth.guard";
import { Controller, Get, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { type FastifyRequest } from "fastify";
import { UserRes } from "./dto/user";
import { UsersRepo } from "./users.repo";

@Controller("users")
export class UsersController {
    constructor(private readonly usersRepo: UsersRepo) {}

    @Get("me")
    @Auth()
    @ApiBearerAuth("JWT")
    @ApiOkResponse({ type: UserRes })
    async getMe(@Req() req: FastifyRequest) {
        const user = await this.usersRepo.getById(req.user.id);
        return new UserRes(user);
    }
}
