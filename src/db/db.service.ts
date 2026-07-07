import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import type { IDatabase } from "pg-promise";
import { DB_CLIENT } from "./db.client";

@Injectable()
export class DBService implements OnModuleDestroy {
    constructor(@Inject(DB_CLIENT) private readonly db: IDatabase<0>) {}

    onModuleDestroy() {
        return this.db.$pool.end();
    }
}
