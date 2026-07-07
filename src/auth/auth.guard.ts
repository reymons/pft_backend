import {
    Injectable,
    UnauthorizedException,
    CanActivate,
    ExecutionContext,
    applyDecorators,
    UseGuards,
} from "@nestjs/common";
import { type FastifyRequest } from "fastify";
import { JwtService } from "@/jwt/jwt.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    private getBearerToken(req: FastifyRequest): string {
        const hdr = req.headers.authorization;
        if (!hdr) return "";
        const [prfx, token] = hdr.split(" ");
        if (prfx !== "Bearer") return "";
        return token ?? "";
    }

    async canActivate(ctx: ExecutionContext) {
        const req = ctx.switchToHttp().getRequest<FastifyRequest>();
        const token = this.getBearerToken(req);
        if (!token) throw new UnauthorizedException();
        try {
            const user = await this.jwtService.verifyAccessToken(token);
            req.user = user;
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }
}

export function Auth() {
    return applyDecorators(UseGuards(AuthGuard));
}
