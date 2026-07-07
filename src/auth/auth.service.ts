import { Injectable } from "@nestjs/common";
import { PasswordService } from "@/password/password.service";
import { UserModel } from "@/users/users.model";
import { UsersRepo } from "@/users/users.repo";

@Injectable()
export class AuthService {
    private readonly HASH_LEN = 64;

    constructor(
        private readonly passwordService: PasswordService,
        private readonly usersRepo: UsersRepo,
    ) {}

    async signUp(name: string, password: string): Promise<UserModel> {
        const hashedPassword = await this.passwordService.createHash(password, this.HASH_LEN);
        return this.usersRepo.save(name, hashedPassword);
    }

    async signIn(name: string, password: string): Promise<UserModel> {
        const user = await this.usersRepo.getByName(name);
        const valid = await this.passwordService.verify(password, user.password, this.HASH_LEN);
        if (!valid) throw new Error("invalid credentials");
        return user;
    }
}
