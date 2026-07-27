import { UserModel } from "./users.model";
import { Inject } from "@nestjs/common";
import { UserEntity } from "./users.entity";
import { DB_CLIENT, type DBClient } from "@/db/db.client";
import { SaveUserDto } from "./dto/repo";

export class UsersRepo {
    constructor(@Inject(DB_CLIENT) private readonly db: DBClient) {}

    private toUserModel(ent: UserEntity): UserModel {
        const user = new UserModel();
        user.id = ent.id;
        user.name = ent.name;
        user.password = ent.password;
        user.createdAt = ent.created_at;
        user.defaultCurrency = ent.default_currency;
        return user;
    }

    async save(dto: SaveUserDto): Promise<UserModel> {
        const ent = await this.db.one<UserEntity>(
            "INSERT INTO users(name, password, default_currency) VALUES ($1, $2, $3) RETURNING id, name, password, created_at, default_currency",
            [dto.name, dto.password, dto.defaultCurrency],
        );
        return this.toUserModel(ent);
    }

    async getById(id: number): Promise<UserModel> {
        const ent = await this.db.one<UserEntity>(
            "SELECT id, name, password, created_at, default_currency FROM users WHERE id = $1",
            id,
        );
        return this.toUserModel(ent);
    }

    async getByName(name: string): Promise<UserModel> {
        const ent = await this.db.one<UserEntity>(
            "SELECT id, name, password, created_at, default_currency FROM users WHERE name = $1",
            name,
        );
        return this.toUserModel(ent);
    }
}
