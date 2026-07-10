import { Inject, Injectable } from "@nestjs/common";
import { type ITask } from "pg-promise";
import { DB_CLIENT, type DBClient } from "./db.client";

@Injectable()
export class Transactor {
    constructor(@Inject(DB_CLIENT) private readonly db: DBClient) {}

    run<T>(cb: (t: ITask<0>) => Promise<T>): Promise<T> {
        return this.db.tx(cb);
    }
}
