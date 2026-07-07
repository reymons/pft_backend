import type { IDatabase, ITask } from "pg-promise";

export type DBClient = IDatabase<0> | ITask<0>;

export const DB_CLIENT = "POSTGRES_DB";
