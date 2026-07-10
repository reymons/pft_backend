import pgp from "pg-promise";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DBService } from "./db.service";
import { DB_CLIENT, DB_HELPERS, DBClient, DBHelpers } from "./db.client";
import { Transactor } from "./db.transactor";

const db = pgp();

@Global()
@Module({
    providers: [
        Transactor,
        DBService,
        {
            provide: DB_CLIENT,
            inject: [ConfigService],
            useFactory: (conf: ConfigService): DBClient => {
                return db({
                    host: conf.getOrThrow<string>("DB_HOST"),
                    port: conf.getOrThrow<number>("DB_PORT"),
                    database: conf.getOrThrow<string>("DB_NAME"),
                    user: conf.getOrThrow<string>("DB_USER"),
                    password: conf.getOrThrow<string>("DB_PASSWORD"),
                });
            },
        },
        {
            provide: DB_HELPERS,
            useFactory: (): DBHelpers => db.helpers,
        },
    ],
    exports: [DB_CLIENT, DB_HELPERS, Transactor],
})
export class DBModule {}
