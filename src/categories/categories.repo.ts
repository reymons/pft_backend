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

    async saveMany(userId: number, names: string[]): Promise<number[]> {
        const data = names.map((name) => ({ user_id: userId, custom_name: name }));
        const cs = new this.helpers.ColumnSet(["user_id", "custom_name"], { table: "categories" });
        const query = this.helpers.insert(data, cs);
        const rows = await this.db.many<{ id: number }>(`${query} RETURNING id`);
        return rows.map((r) => r.id);
    }
}
