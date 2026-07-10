import { Injectable } from "@nestjs/common";
import { PasswordService } from "@/password/password.service";
import { UserModel } from "@/users/users.model";
import { UsersRepo } from "@/users/users.repo";
import type { SignUpDto, SignInDto } from "./dto/service";

@Injectable()
export class AuthService {
    private readonly HASH_LEN = 64;

    constructor(
        private readonly passwordService: PasswordService,
        private readonly usersRepo: UsersRepo,
    ) {}

    async signUp(dto: SignUpDto): Promise<UserModel> {
        const hashedPassword = await this.passwordService.createHash(dto.password, this.HASH_LEN);
        return this.usersRepo.save(dto.name, hashedPassword);
    }

    async signIn(dto: SignInDto): Promise<UserModel> {
        const user = await this.usersRepo.getByName(dto.name);
        const valid = await this.passwordService.verify(dto.password, user.password, this.HASH_LEN);
        if (!valid) throw new Error("invalid credentials");
        return user;
    }
}
