import { UserModel } from "./users.model";
import { Inject } from "@nestjs/common";
import { UserEntity } from "./users.entity";
import { DB_CLIENT, type DBClient } from "@/db/db.client";

export class UsersRepo {
    constructor(@Inject(DB_CLIENT) private readonly db: DBClient) {}

    private toUserModel(ent: UserEntity): UserModel {
        const user = new UserModel();
        user.id = ent.id;
        user.name = ent.name;
        user.password = ent.password;
        user.createdAt = ent.created_at;
        return user;
    }

    async save(name: string, password: string): Promise<UserModel> {
        const ent = await this.db.one<UserEntity>(
            "INSERT INTO users(name, password) VALUES ($1, $2) RETURNING id, name, password, created_at",
            [name, password],
        );
        return this.toUserModel(ent);
    }

    async getById(id: number): Promise<UserModel> {
        const ent = await this.db.one<UserEntity>("SELECT id, name, password, created_at FROM users WHERE id = $1", id);
        return this.toUserModel(ent);
    }

    async getByName(name: string): Promise<UserModel> {
        const ent = await this.db.one<UserEntity>(
            "SELECT id, name, password, created_at FROM users WHERE name = $1",
            name,
        );
        return this.toUserModel(ent);
    }
}
