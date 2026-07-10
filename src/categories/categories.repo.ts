import { Inject, Injectable } from "@nestjs/common";
import { DB_CLIENT, DB_HELPERS, type DBHelpers, type DBClient } from "@/db/db.client";
import { CategoryEntity } from "./categories.entity";
import { CategoryModel } from "./categories.model";

@Injectable()
export class CategoriesRepoFactory {
    constructor(@Inject(DB_HELPERS) private readonly helpers: DBHelpers) {}

    createRepo(db: DBClient): CategoriesRepo {
        return new CategoriesRepo(db, this.helpers);
    }
}

@Injectable()
export class CategoriesRepo {
    constructor(
        @Inject(DB_CLIENT) private readonly db: DBClient,
        @Inject(DB_HELPERS) private readonly helpers: DBHelpers,
    ) {}

    private toModel(ent: CategoryEntity): CategoryModel {
        const m = new CategoryModel();
        m.id = ent.id;
        m.userId = ent.user_id;
        m.type = ent.type;
        m.customName = ent.custom_name;
        return m;
    }

    async getAllByUserId(id: number): Promise<CategoryModel[]> {
        const rows = await this.db.many<CategoryEntity>(
            "SELECT id, user_id, custom_name, type FROM categories WHERE user_id = $1",
            id,
        );
        return rows.map((r) => this.toModel(r));
    }

    async getAllDefault(): Promise<CategoryModel[]> {
        const rows = await this.db.many<CategoryEntity>(
            "SELECT id, user_id, custom_name, type FROM categories WHERE user_id IS NULL",
        );
        return rows.map((r) => this.toModel(r));
    }

    async saveMany(userId: number, names: string[]): Promise<number[]> {
        const data = names.map((name) => ({ user_id: userId, custom_name: name }));
        const cs = new this.helpers.ColumnSet(["user_id", "custom_name"], { table: "categories" });
        const query = this.helpers.insert(data, cs);
        const rows = await this.db.many<{ id: number }>(`${query} RETURNING id`);
        return rows.map((r) => r.id);
    }

    async save(userId: number, name: string): Promise<CategoryModel> {
        const ent = await this.db.one<CategoryEntity>(
            "INSERT INTO categories(user_id, custom_name) VALUES ($1, $2) RETURNING id, user_id, custom_name, type",
            [userId, name],
        );
        return this.toModel(ent);
    }

    async delete(categoryId: number, userId: number): Promise<void> {
        await this.db.none("DELETE FROM categories WHERE id = $1 AND user_id = $2", [categoryId, userId]);
    }

    async patch(categoryId: number, userId: number, name: string): Promise<CategoryModel> {
        const ent = await this.db.one<CategoryEntity>(
            "UPDATE categories SET custom_name = $1 WHERE id = $2 AND user_id = $3 RETURNING id, user_id, custom_name, type",
            [name, categoryId, userId],
        );
        return this.toModel(ent);
    }
}
